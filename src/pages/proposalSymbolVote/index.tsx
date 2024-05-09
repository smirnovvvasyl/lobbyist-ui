import { Box, Button, Grid, Typography, Slider } from "@mui/material";
import { Link } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import {
  useLocation,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { EnumProtocolName } from "../../@types/protocol";
import classNames from "classnames";
import styles from "../../components/form/styles.module.scss";
import { Remarkable } from "remarkable";
import {
  NavBack,
  ProposalCardVaultEmission,
  ProposalCardVaultIncentive,
  ProposalCardVaultReward,
  ProposalCardPerVotes,
  ProposalCardTargetVotes,
  TimeRemaining,
} from "../../components";
import { useSelector } from "../../redux/store";
import { RootState } from "../../redux/store";
import { GET_PROPOSAL } from "../../gql";
import { useLazyQuery } from "@apollo/client";
import snapshot from "@snapshot-labs/snapshot.js";
import Action from "../../services";
import { NotificationManager } from "react-notifications";
import { addRewards } from "../../blockchain";
import { Tokens } from "../../token";
import { Coins } from "../../blockchain";
import NumberType from "../../common/number";
import { History } from "../../@types/proposal";
import "./vote.scss";
import { links } from "./snapshotlink";

var md = new Remarkable();
var history: History[] = [];
if (localStorage.getItem("history")) {
  var data = JSON.parse(`${localStorage.getItem("history")}`);
  data.forEach((element: any) => {
    history.push({
      type: element.type,
      chain: element.chain,
      rewardCurrency: element.rewardCurrency,
      address: element.address,
    });
  });
}

type Props = {};

const chainImg: any = {
  1: "../../assets/chainLists/ethereum.svg",
  10: "../../assets/chainLists/optimism.svg",
  56: "../../assets/chainLists/bsc.svg",
  137: "../../assets/chainLists/polygon.svg",
  250: "../../assets/chainLists/fantom.svg",
  42161: "../../assets/chainLists/arbitrum.svg",
  43114: "../../assets/chainLists/avalanche.svg"
}

const hub = "https://hub.snapshot.org";
const client = new snapshot.Client712(hub);

const ProposalSymbolVote = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { symbol } = useParams();
  const walletAddress: any = useSelector(
    (state: RootState) => state.wallet.address
  );
  const provider: any = useSelector(
    (state: RootState) => state.provider.provider
  );
  const chainId: any = useSelector((state: RootState) => state.chain.id);
  const [voteState, setVoteState] = useState(false);
  const [getProposal] = useLazyQuery(GET_PROPOSAL);
  const [voteWeight, setVoteWeight] = useState(0);
  const [myVoteWeight, setMyVoteWeight] = useState(0);
  const [proposalInfo, setProposalInfo]: any = useState([]);
  const [modal, setModal] = useState(false);
  const [addRewardAmount, setAddRewardAmount] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [addrewardButton, setButton] = useState(true);
  const [currency, setRewardCurrency] = useState("");
  const [currencyApi, setRewardCurrencyApi] = useState("");
  const [usdAmount, setUsdAmount] = useState(0);

  const isProposer = searchParams.get("proposer") && true;
  const [showMore, setShowMore] = useState(true);
  const [description, setDescription] = useState("");
  const navState = location.state as any;
  let { proposal: currentProposal } = navState;

  useEffect(() => {
    var rewardCurrency = Tokens[currentProposal.chain].filter(
      (token: any) => token.address === currentProposal.rewardCurrency
    );
    setRewardCurrency(rewardCurrency[0].display);
    setRewardCurrencyApi(rewardCurrency[0].api);
    setDescription(md.render(currentProposal.description));
  }, [currentProposal]);

  useEffect(() => {
    GetInfo();
  }, [walletAddress]);

  useEffect(() => {
    setUsdAmount(0);
  }, [modal]);
  // Get vote weight of you 
  const GetInfo = async () => {
    const proposalinfo = await getProposal({
      variables: { id: currentProposal.proposalId },
    });
    setProposalInfo(proposalinfo.data.proposal);
    const req = {
      strategies: proposalinfo.data.proposal.strategies,
      snapshot: Number(proposalinfo.data.proposal.snapshot),
      space: proposalinfo.data.proposal.space.id,
      address: walletAddress,
      network: proposalinfo.data.proposal.network,
    };
    const result = await Action.GetVoteWeight(req);
    setVoteWeight(result.vp);
  }

  // Vote on proposal that you select
  const voteProposal = async () => {
    try {
      if (!walletAddress) {
        NotificationManager.error("Oops, Please connect wallet and try again!");
        return;
      }
      var data = {
        voter: walletAddress,
        poolId: currentProposal.poolId,
        voteAmount: voteWeight,
        proposalId: currentProposal.proposalId,
        chain: currentProposal.chain,
        type: currentProposal.proposalType
      };
      let choice: any;
      let choiceData: any;
      var outcome = JSON.parse(currentProposal.protocol);
      if (proposalInfo.type == "single-choice" || proposalInfo.type == "basic") {
        choice = proposalInfo.choices.indexOf(outcome.data) + 1;
      } else if (proposalInfo.type == "quadratic" || proposalInfo.type == "weighted") {
        choiceData = JSON.parse(outcome.data);
        let setChoiceData: any = {};
        choiceData.forEach((mydata: any) => {
          setChoiceData[proposalInfo.choices.indexOf(mydata.value) + 1] = Number(mydata.amount);
        });
        choice = setChoiceData;
      } else {
        var newChoiceData: any = [];
        choiceData = JSON.parse(outcome.data);
        for (var i = 0; i < choiceData.length; i++) {
          newChoiceData.push(proposalInfo.choices.indexOf(choiceData[i]) + 1);
        }
        choice = newChoiceData;
      }
      const receipt = await client.vote(provider, walletAddress, {
        space: proposalInfo.space.id,
        proposal: proposalInfo.id,
        type: proposalInfo.type,
        choice: choice,
        reason: "This choice makes a lot of sense",
        app: "Lobbyist",
      });
      if (receipt) {
        localStorage.setItem("history", JSON.stringify(history));
        const result: any = await Action.Vote(data);
        if (result.status) {
          NotificationManager.success("Voted Successfully", "Success");
          navigate(`/proposal/${symbol}`);
        } else {
          NotificationManager.error(result.message, "Error");
        }
      }
    } catch (error: any) {
      NotificationManager.error(`Oops,${error.error_description}`, "Error");
      console.log(error.error_description);
    }
  };
  // Add reward of proposal that you want.
  const AddReward = async () => {
    if (chainId == currentProposal.chain) {
      let signer: any = provider?.getSigner();
      const result: any = await addRewards({
        id: currentProposal.poolId,
        amount: addRewardAmount,
        rewardtype: currentProposal.rewardCurrency,
        walletAddress: walletAddress,
        buttonType: addrewardButton,
        signer: signer,
        chain: currentProposal.chain,
        type: currentProposal.proposalType
      });
      if (!addrewardButton) {
        handleClose();
      }
      if (!result.status) {
        NotificationManager.error(result.message, "Error");
      } else {
        setButton(false);
        NotificationManager.success(result.message, "Success");
      }
    } else {
      NotificationManager.error("Switch your chain to proposal Chain", "Error");
    }
  };

  const handleClose = () => {
    setModal(false);
    setVoteState(false);
  };

  const onChangeAmount = async (amount: string) => {
    setAddRewardAmount(Number(amount));
    var result = await Coins(currencyApi);
    setUsdAmount(result * Number(amount));
  };

  const slideChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setMyVoteWeight(newValue);
    }
  }

  return (
    <>
      <Box className="main-body flex flex-col grow">
        <Box className="flex-col main-content gap-14 margindw" style={{ marginBottom: "30px" }}>
          <Box className="flex justify-between proposer-flex">
            <NavBack />
            {isProposer ? (
              <Box className="gap-8">
                <Button
                  onClick={() => setModal(true)}
                  className="proposer-button"
                  variant="contained"
                  color="tealLight"
                >
                  Add Rewards
                </Button>
              </Box>
            ) : (
              <Box className="grid gap-custom">
                <Button
                  onClick={() => setModal(true)}
                  className="proposer-button"
                  variant="contained"
                  color="tealLight"
                >
                  Add Rewards
                </Button>
                {currentProposal.proposalType == "fixed" ? voteWeight === 0 ? (
                  <Button disabled variant="contained" color="secondary">
                    Vote
                  </Button>
                ) : (
                  <Button
                    onClick={voteProposal}
                    variant="contained"
                    color="tealLight"
                  >
                    Vote
                  </Button>
                ) : voteWeight === 0 || currentProposal.totalVoteWeight >= currentProposal.targetVotes ? (
                  <Button disabled variant="contained" color="secondary">
                    Vote
                  </Button>
                ) : (
                  <Button
                    onClick={voteProposal}
                    variant="contained"
                    color="tealLight"
                  >
                    Vote
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box className="flex flex-col mt-12">
              <Box style={{ marginBottom: "30px" }}>
                <img src={chainImg[currentProposal.chain]} width="150" alt="matic"></img>
              </Box>
              <Box className="flex flex-col">
                <Typography variant="h5">{navState.proposal.name}</Typography>
                {/* <Typography color={colors.textGray}> */}
                {showMore ? (
                  <div
                    style={{ color: "gray" }}
                    className="description"
                    dangerouslySetInnerHTML={{
                      __html: description.slice(0, 80),
                    }}
                  ></div>
                ) : (
                  <div
                    style={{ color: "gray" }}
                    className="description"
                    dangerouslySetInnerHTML={{ __html: description }}
                  ></div>
                )}
                {/* </Typography> */}
                {description.length > 80 ? (
                  <Button
                    color="inherit"
                    className="load-button"
                    onClick={() => setShowMore(!showMore)}
                  >
                    {showMore ? "Show more" : "Show less"}
                  </Button>
                ) : (
                  ""
                )}
              </Box>
              <Box className="flex flex-col gap-8">
                <Typography className="vpa">
                  MY AVAILABLE VOTING POWER:{" "}
                  <strong className="currcol">
                    {" "}
                    {voteWeight > 0
                      ? voteWeight.toFixed(2) + " " + proposalInfo.symbol
                      : ""}
                  </strong>{" "}
                </Typography>
              </Box>
              <Box className="flex flex-col gap-8">
                <ProposalCardVaultIncentive
                  proposal={currentProposal}
                  isProposer={isProposer}
                  voteWeight={voteWeight}
                />
                <ProposalCardVaultEmission proposal={currentProposal} />
                <ProposalCardVaultReward
                  proposal={currentProposal}
                  isProposer={isProposer}
                  voteWeight={voteWeight}
                  voteType={proposalInfo.type}
                />
                {currentProposal.proposalType == "variable" && (
                  <>
                    <ProposalCardPerVotes proposal={currentProposal} />
                    <ProposalCardTargetVotes proposal={currentProposal} />
                  </>
                )}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6} className="flex !flex-col">
            <TimeRemaining time={proposalInfo.end * 1000}></TimeRemaining>
            <Box className="relative flex flex-auto">
              <Box className="flex flex-col flex-auto gap-2 text-center pt-6 md:text-right md:pt-0 md:absolute md:right-0 md:bottom-0">
                <a
                  href={
                    "https://snapshot.org/#/" +
                    links[`${symbol}`] +
                    ".eth" +
                    "/proposal/" +
                    proposalInfo.id
                  }
                  target="_block"
                >
                  Go to Snapshot
                </a>
                <Link to={"/proposal/" + symbol}>
                  Go to{" "}
                  {`${EnumProtocolName[symbol as keyof typeof EnumProtocolName]
                    }`}
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Box className="mt-16 mb-32"></Box>
      </Box>

      <Dialog className="modaladd" open={modal} onClose={handleClose}>
        <DialogTitle className="modaladdpaper modaladdpaper-title">
          Add more rewards
        </DialogTitle>
        <DialogContent className="modaladdpapermid">
          <div className="modaladdpaper title">
            <div style={{ margin: "0 auto 0 0" }} className="modaladdpaper">
              <div>Reward Currency:&nbsp;</div>
              <div>{currency}</div>
            </div>
            <div style={{ margin: "0 0 0 auto" }} className="modaladdpaper">
              <div>USD Value:&nbsp;</div>
              <div>{NumberType(usdAmount.toFixed(2), 2)}</div>
            </div>
          </div>
          <div className="modaladdpaper titlebtm">
            <div style={{ margin: "0 auto 0 0" }} className="modaladdpaper">
              <div>2.5% Lobbyist Fee:&nbsp;</div>
            </div>
            <div style={{ margin: "0 0 0 auto" }} className="modaladdpaper">
              <div>USD Value:&nbsp;</div>
              <div>{NumberType((usdAmount * 0.025).toFixed(2), 2)}</div>
            </div>
          </div>
        </DialogContent>
        <DialogContent className="modaladdpaper">
          <TextField
            className={classNames(styles.input)}
            id="reward"
            placeholder="Input your amount"
            type="number"
            fullWidth
            onChange={(e) => onChangeAmount(e.target.value)}
          ></TextField>
        </DialogContent>
        <DialogContent className="modaladdpaper">
          <Typography className="feedec">
            The fee will be deducted from the Max Reward on deposit
          </Typography>
        </DialogContent>
        <DialogActions className="modaladdpaperbtm">
          {addrewardButton ? (
            <Button
              className="proposer-button"
              variant="contained"
              color="tealLight"
              onClick={() => {
                AddReward();
              }}
            >
              Approve
            </Button>
          ) : (
            <Button
              className="proposer-button"
              variant="contained"
              color="tealLight"
              onClick={() => {
                AddReward();
              }}
            >
              Add Rewards
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {/* <Dialog open={voteState} onClose={handleClose}>
        <DialogTitle className="voteModal modaladdpaper-title">
          Vote for this Proposal
        </DialogTitle>
        <DialogContent className="voteModal">
          <Slider
            className="slider"
            value={myVoteWeight}
            min={0}
            step={0.01}
            max={voteWeight}
            onChange={slideChange}
            valueLabelDisplay="auto"
            aria-labelledby="non-linear-slider"
          />
        </DialogContent>
        <DialogActions className="modaladdpaperbtm">
          <Button
            className="proposer-button"
            variant="contained"
            color="tealLight"
            onClick={handleClose} >
            Cancel
          </Button>
          <Button
            className="proposer-button"
            variant="contained"
            color="tealLight"
            onClick={() => {
              voteProposal();
            }}
          >
            Vote
          </Button>
        </DialogActions>
      </Dialog> */}
    </>
  );
};

export default ProposalSymbolVote;
