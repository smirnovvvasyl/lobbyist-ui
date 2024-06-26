import axios from "axios";
import { setCurrentProposal } from "../redux/slices/proposal";
import { dispatch } from "../redux/store";
import { Tokens } from "../token";
import { Coins } from "../blockchain";
import { config } from "../config/config";

axios.defaults.baseURL = config.REACT_APP_SERVERENDPOINT;

var baseURL = "https://score.snapshot.org/";

const Proposal_load = async (req: any) => {
    try {
        var res = await axios.post("/api/load-proposal", req);
        for (var i = 0; i < res.data.data.length; i++) {
            var api = Tokens[res.data.data[i].chain].filter((token: any) => token.address === res.data.data[i].rewardCurrency);
            var tokenPrice = await Coins(api[0].api);
            res.data.data[i].usdAmount = res.data.data[i].reward * tokenPrice;
        }
        dispatch(setCurrentProposal(res.data));
    } catch (err: any) {
        return false;
    }
};
const Vote = async (req: any) => {
    try {
        var res = await axios.post("/api/vote", req);
        return res.data;
    } catch (error) {
        console.log(error);
    }
}

const GetVoteWeight = async (req: any) => {
    try {
        var res = await axios.post(baseURL, {
            "jsonrpc": "2.0",
            "method": "get_vp",
            "params": {
                "address": req.address,
                "network": req.network,
                "strategies": req.strategies,
                "snapshot": req.snapshot,
                "space": req.space,
                "delegation": false
            },
            "id": null
        });
        return res.data.result;
    } catch (err: any) {
        console.log(err);
    }
}

// Export Functions
const Action = {
    Proposal_load,
    GetVoteWeight,
    Vote
};

export default Action;
