import { Proposal } from "../../../@types/proposal";
import "./index.scss";
import NumberType from "../../../common/number";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector, RootState } from "../../../redux/store";
import { useNavigate } from "react-router-dom";
const ChainImg: any = {
    1: "../../assets/chains/eth.svg",
    10: "../../assets/chains/optimism.png",
    56: "../../assets/chains/bsc.png",
    137: "../../assets/chains/polygon.svg",
    250: "../../assets/chains/fantom.png",
    42161: "../../assets/chains/arbitrum.svg",
    43114: "../../assets/chains/avax.png"
}
const ProtocolImg: any = {
    qidao: "../../assets/icons/pro-qidao.svg",
    aave: "../../assets/icons/pro-aave.svg",
    saddlefinance: "../../assets/icons/saddle.svg",
    aurafinance: "../../assets/icons/aura.svg",
    beets: "../../assets/icons/beethovenx.svg",
    ribbon: "../../assets/icons/ribbon.svg",
    onx: "../../assets/icons/onx.svg",
    vesqdao: "../../assets/icons/vesq.svg"
}
type Props = {
    proposal: Proposal;
}
const ProposalItem = (props: Props) => {
    const navigate = useNavigate();
    const walletAddress: any = useSelector(
        (state: RootState) => state.wallet.address
    );
    const { proposal } = props;
    const onJoinClick = (proposal: Proposal) => {
        const path = proposal.address !== walletAddress ? "../proposal/" + proposal.type + "/vote" : "../proposal/" + proposal.type + "/vote?proposer=1";
        navigate(path, {
            state: {
                proposal,
            },
        });
    };
    return (
        <div className="item item-gap">
            <div className="flex justify-between">
                <img width="40" height="40" src={ProtocolImg[proposal.type]}></img>
                <img style={{ width: "30px", height: "30px" }} src={ChainImg[proposal.chain]}></img>
            </div>
            <h2 className="item-font-2">{proposal.name.length > 20 ? (proposal.name.slice(0, 20) + "...") : proposal.name}</h2>
            <div>
                <p className="item-font-1">VOTING FOR</p>
                <h4>{proposal.choice.length > 35 ? (proposal.choice.slice(0, 35) + "...") : proposal.choice}</h4>
            </div>
            <div>
                <p className="item-font-1">VOTE INCENTIVE</p>
                <h4>$ {NumberType((proposal.usdAmount).toString(), 2)}</h4>
            </div>
            <div>
                <p className="item-font-1">TOTAL VOTES</p>
                <h4>{NumberType((proposal.totalVoteWeight).toString(), 2)}</h4>
            </div>
            <div className="flex justify-between">
                <div>
                    <p className="item-font-1">$/VOTE</p>
                    <h4>{proposal.totalVoteWeight > 0 ? NumberType((proposal.usdAmount / proposal.totalVoteWeight).toFixed(6), 6) : "$0"}</h4>
                </div>
                <Button className="pro-btn" onClick={() => onJoinClick(proposal)}
                    variant="contained" color="tealLight"
                >
                    View
                </Button>
            </div>
        </div>
    )
}
export default ProposalItem;