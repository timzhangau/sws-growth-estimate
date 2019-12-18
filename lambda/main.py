import json
import pandas as pd
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
    headers = {"Accept": "application/vnd.simplywallst.v2"}
    url = f"https://simplywall.st/api/company/{ticker}?include=analysis.extended.raw_data&version=2.0"

    r = requests.get(url, headers=headers)
    if r.status_code == 200:
        return r.json()
    else:
        raise HTTPError("Unable to get data from SWS")


def get_raw_data_by_key(data, key):
    """ get historical data by data field key"""
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
    df["prediction"] = ols_result.predict(df[["period"]])
    return ols_result, df


def main(ticker="AU:YOW"):
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
            growth_result[k]["ols"] = vars(growth_result[k]["ols"])
            growth_result[k]["df"] = growth_result[k]["df"].to_dict()

        # calculate some stats
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
            f_dict = get_raw_data_by_key(response_data, f)
            # remove any data gaps otherwise the dataframe construction will fail
            f_dict = {k: v for k, v in f_dict.items() if v}
            df_dict[f] = pd.DataFrame.from_dict(f_dict, orient="index")

        ratios_df = pd.DataFrame()
        for f in fields_list:
            ratios_df[f] = df_dict[f]["value"]

        ratios_df["asset_turnover"] = ratios_df["total_rev"] / ratios_df["total_assets"]
        ratios_df["np_margin"] = ratios_df["ni"] / ratios_df["total_rev"]
        ratios_df["equity_multiplier"] = (
            ratios_df["total_assets"] / ratios_df["total_equity"]
        )
        ratios_df["equity_multiplier"] = (
            ratios_df["total_assets"] / ratios_df["total_equity"]
        )

        return {
            "growth_analytics": growth_result,
            "other_analytics": ratios_df.to_dict(),
        }
    except Exception as e:
        return {"Error Message": str(e)}


def lambda_handler(event, context):
    try:
        request_body = json.loads(event["body"])
        ticker = request_body["ticker"]
        result = main(ticker)
        return {"statusCode": 200, "body": json.dumps(result)}
    except Exception as e:
        return {"statusCode": 500, "body": e}


if __name__ == "__main__":
    test = main()
    print(test)
