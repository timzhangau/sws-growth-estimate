# this is for deploying lambda with serverless
try:
    import unzip_requirements
except ImportError:
    pass

import json
import pandas as pd
import numpy as np
import statsmodels.formula.api as smf
import requests
from urllib3.exceptions import HTTPError

# import matplotlib.pyplot as plt
# import statsmodels.api as sm
# from statsmodels.graphics.regressionplots import abline_plot


def read_test_data():
    """ this is used for local development """
    file_path = "./data/AU-YOW.json"
    with open(file_path, "r") as f:
        data = json.load(f)
    return data


def get_data_by_ticker(ticker):
    """ get data from SWS API """
    headers = {"Accept": "application/vnd.simplywallst.v2"}
    url = f"https://simplywall.st/api/company/{ticker}?include=analysis.extended.raw_data&version=2.0"

    r = requests.get(url, headers=headers)
    if r.status_code == 200:
        return r.json()
    else:
        raise HTTPError("Unable to get data from SWS")


def get_raw_data_by_key(data, key):
    """ get historical data by data field key """
    history = data["data"]["analysis"]["data"]["extended"]["data"]["raw_data"]["data"][
        "past"
    ]
    result = {}
    for k, v in history.items():
        result[k] = v.get(key)
    return result


def fit_ols(df):
    model = smf.ols(formula="value ~ period", data=df)
    result = model.fit()
    # ax = df.plot(x='period', y='value', kind='scatter')
    # abline_plot(model_results=result, ax=ax)
    return result


def estimate_growth_with_ols(data, data_field):
    history_dict = get_raw_data_by_key(data, data_field)
    df = pd.DataFrame.from_dict(history_dict, orient="index")
    df.sort_index(ascending=True, inplace=True)
    df["period"] = range(1, len(df) + 1)
    df = df.dropna()
    ols_result = fit_ols(df)
    future_df = allocate_future_period_df(
        df["quarter"][-1], df["year"][-1], df["period"][-1]
    )
    df = df.append(future_df, sort=False)
    df["prediction"] = ols_result.predict(df[["period"]])
    df["label"] = df["year"].map(str) + " Q" + df["quarter"].map(str)
    df.loc[df["id"].isnull(), "id"] = f"estimated_{data_field}".upper()
    return ols_result, df


def allocate_future_period_df(quarter, year, period, num=8):
    output_list = []
    last_qtr = quarter
    last_yr = year
    last_pd = period
    for n in range(0, num):
        last_pd += 1
        if last_qtr < 4:
            last_qtr += 1
            output_list.append([last_qtr, last_yr, last_pd])
        else:
            last_qtr = 1
            last_yr += 1
            output_list.append([last_qtr, last_yr, last_pd])
    return pd.DataFrame(output_list, columns=["quarter", "year", "period"])


def project_with_industry_averages(df, rate):
    tmp_df = df.copy()
    tmp_df["projected"] = np.nan
    last_value = 0.0
    for index, row in tmp_df.iterrows():
        if np.isnan(row["value"]):
            last_value = last_value * (1 + rate / 4)
            tmp_df.loc[index, "projected"] = last_value
        else:
            last_value = row["value"]
    return tmp_df["projected"]


def calculate_additional_stats(data):
    """ calculate some additional stats, not actually used for keeping the analytics simple """
    df_dict = {}
    fields_list = [
        "total_rev",
        "g_a_expense",
        "gross_profit",
        "operating_revenue",
        "ebitda",
        "ni",
        "total_assets",
        "total_equity",
    ]
    for f in fields_list:
        f_dict = get_raw_data_by_key(data, f)
        # remove any data gaps otherwise the dataframe construction will fail
        f_dict = {k: v for k, v in f_dict.items() if v}
        df_dict[f] = pd.DataFrame.from_dict(f_dict, orient="index")

    ratios_df = pd.DataFrame()
    for f in fields_list:
        if df_dict[f].empty:
            ratios_df[f] = np.nan
        else:
            ratios_df[f] = df_dict[f]["value"]

    ratios_df["asset_turnover"] = ratios_df["total_rev"] / ratios_df["total_assets"]
    ratios_df["np_margin"] = ratios_df["ni"] / ratios_df["total_rev"]
    ratios_df["equity_multiplier"] = (
        ratios_df["total_assets"] / ratios_df["total_equity"]
    )
    ratios_df["equity_multiplier"] = (
        ratios_df["total_assets"] / ratios_df["total_equity"]
    )
    return ratios_df


def main(ticker):
    try:
        # get data from api (or read from local for dev)
        # response_data = read_test_data()
        response_data = get_data_by_ticker(ticker)

        # estimate growth with ols
        growth_result = {}
        for k in ["total_rev", "g_a_expense"]:
            growth_result[k] = {}
            growth_result[k]["ols"], growth_result[k]["df"] = estimate_growth_with_ols(
                response_data, k
            )

            # parse the result to return as json later
            growth_result[k]["ols"] = {
                "params": growth_result[k]["ols"].params.tolist(),
                "pvalues": growth_result[k]["ols"].pvalues.tolist(),
                "resid": growth_result[k]["ols"].resid.tolist(),
                "rsquared": growth_result[k]["ols"].rsquared,
                "rsquared_adj": growth_result[k]["ols"].rsquared_adj,
            }

            # use industry and market average to project future revenue
            if k == "total_rev":
                industry_average = response_data["data"]["analysis"]["data"][
                    "extended"
                ]["data"]["industry_averages"]["revenueGrowthAnnual"]
                market_average = response_data["data"]["analysis"]["data"]["extended"][
                    "data"
                ]["industry_averages"]["all"]["revenueGrowthAnnual"]
                growth_result[k]["df"]["industry_avg"] = project_with_industry_averages(
                    growth_result[k]["df"], industry_average
                )
                growth_result[k]["df"]["market_avg"] = project_with_industry_averages(
                    growth_result[k]["df"], market_average
                )
            growth_result[k]["df"] = growth_result[k]["df"].to_dict(orient="records")

        return {
            "growth_analytics": growth_result,
            # "other_analytics": calculate_additional_stats(response_data).to_dict(
            #     orient="records"
            # ),
        }
    except Exception:
        raise


def lambda_handler(event, context):
    try:
        request_body = json.loads(event["body"])
        ticker = request_body["ticker"]
        result = main(ticker)
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps(result),
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": e,
        }


# if __name__ == "__main__":
#     test = main(ticker="AU:CBA")
#     print(test)
