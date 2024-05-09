import { Box, Button, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate, useParams } from "react-router-dom";
import { useFieldArray, useForm } from "react-hook-form";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import classNames from "classnames";
import { useQuery } from "@apollo/client";
import { NotificationManager } from "react-notifications";
import {
	FormTextField,
	FormSelect,
	OutcomeChoiceForm,
	MultiChoiceForm
} from "../../../../components/form";
import { colors } from "../../../../common";
import { useEffect, useRef, useState } from "react";
import { GET_PROPOSALS } from "../../../../gql";
import { Tokens } from "../../../../token";
import { useSelector } from "../../../../redux/store";
import { RootState } from "../../../../redux/store";
import { dispatch } from "../../../../redux/store";
import { setClickAddress } from "../../../../redux/slices/clickToken";
import loader from "../../../../assets/loader.gif";
import { createProposal, createVariable } from "../../../../blockchain";
import { Coins } from "../../../../blockchain";
import NumberType from "../../../../common/number";

const BoxForm = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.secondary.main,
}));

type Props = {
	name: String;
};

interface SnapShotData {
	value: number;
	display: string;
}

// interface snapInterface extends

const ProposalForm = (props: Props) => {
	const { id, prsalType } = useParams();
	const [myloading, setMyLoading] = useState(false);
	const [submitType, setSubmitType] = useState(false);
	const [name, setName] = useState("");
	const [time, setTime] = useState("");
	const [address, setAddress] = useState("");
	const [snapshot, setSnapshot] = useState<SnapShotData[]>([]);
	const [voteOption, setVoteOption] = useState<SnapShotData[]>([]);
	const [minVotes, setMinVotes] = useState(0);
	const [minReward, setMinReward] = useState(0);
	const [maxReward, setMaxReward] = useState(0);
	const [targetVotes, setTargetVotes] = useState(0);
	const [usd, setUsd] = useState(0);
	const [proposalType, setProposalType] = useState("single-choice");
	const walletAddress: any = useSelector(
		(state: RootState) => state.wallet.address
	);
	const chainName: any = useSelector((state: RootState) => state.chain.id);
	const [rewardType, setRewardType] = useState(Tokens[chainName][0].display);

	const provider: any = useSelector(
		(state: RootState) => state.provider.provider
	);
	// Get protocol type and symbol
	useEffect(() => {
		if (props.name === "qidao") {
			setName("qidao.eth");
			setValue("platformType", "qidao");
		} else if (props.name === "aave") {
			setName("aave.eth");
			setValue("platformType", "aave");
		} else if (props.name === "saddlefinance") {
			setName("saddlefinance.eth");
			setValue("platformType", "saddlefinance");
		} else if (props.name === "aurafinance") {
			setName("aurafinance.eth");
			setValue("platformType", "aurafinance");
		} else if (props.name === "beets") {
			setName("beets.eth");
			setValue("platformType", "beets");
		} else if (props.name === "onx") {
			setName("onx-finance.eth");
			setValue("platformType", "onx");
		} else if (props.name === "ribbon") {
			setName("gauge.rbn.eth");
			setValue("platformType", "ribbon");
		} else if (props.name === "vesqdao") {
			setName("vesqdao.eth");
			setValue("platformType", "vesqdao");
		}
	}, [props.name]);

	// Get token price that you select
	useEffect(() => {
		const tokenPrice = async () => {
			var currencyType = Tokens[chainName].filter(
				(token: any) => token.display === rewardType
			);
			var price = await Coins(currencyType[0].api);
			setUsd(price);
		};
		tokenPrice();
	}, [maxReward, minReward]);
	// Set your wallet Address
	useEffect(() => {
		if (walletAddress !== "") {
			setValue("userAddress", walletAddress);
		}
	}, [walletAddress]);

	const { data } = useQuery(GET_PROPOSALS, {
		variables: { name: name },
		pollInterval: 0,
	});
	// Set Vote options
	const ClickSnap = (e: any) => {
		const temp = [] as SnapShotData[];
		setProposalType(data?.proposals[e].type);
		for (var i = 0; i < data?.proposals[e].choices.length; i++) {
			temp.push({
				value: i,
				display: data?.proposals[e].choices[i],
			});
			setVoteOption(temp);
		}
		const date = new Date(data?.proposals[e].end * 1000);
		setValue("endTime", (data?.proposals[e].end * 1000).toString());
		setValue("proposalId", data?.proposals[e].id);
		setValue("proposalName", data?.proposals[e].title);
		setValue("proposalDescription", data?.proposals[e].body);
		// setProposalName(data?.proposals[e].title);
		// setProposalDescription(data?.proposals[e].body);
		timeStyle(date);
	};

	var monthName = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	// Set time of proposal
	const timeStyle = (date: Date) => {
		const month = date.getMonth();
		const hour = myHour(date);
		const day = date.getDate();
		const year = date.getFullYear();
		const result = monthName[month] + " " + day + ", " + year + ", " + hour;
		setTime(result);
	};

	const myHour = (date: Date) => {
		if (date.getHours() < 12) {
			return date.getHours() + " AM";
		} else {
			return date.getHours() - 12 + " PM";
		}
	};
	// Set Proposals
	useEffect(() => {
		const temp = [] as SnapShotData[];
		data?.proposals?.map((i: any, key: number) => {
			temp.push({
				value: key,
				display: i.title,
			});
		});
		setSnapshot(temp);
	}, [data]);

	const navigate = useNavigate();

	const clickToken = (e: any) => {
		setAddress(e);
		dispatch(setClickAddress(e));
	};

	const {
		handleSubmit,
		control,
		setValue,
	} = useForm({
		defaultValues: {
			platformType: "",
			proposalName: "",
			proposalDescription: "",
			snapshotProposal: "",
			desiredVote: "",
			endTime: "",
			gaugeFixed: "",
			rewardCurrency: "WMATIC",
			minimumBribe: "0",
			loyaltyVote: "",
			votePercent: [{ value: 10 }],
			votePercentNum: [{ value: 10 }],
			range: [{ value: [0, 10] }],
			rangeNum: [{ value: [0, 10] }],
			payout: "0",
			userAddress: "",
			minReward: "0",
			minVotes: "0",
			targetVotes: "0",
			proposalId: "",
			singleValue: ''

		},
	});

	const {
		fields: votePercentFields,
		append: votePercentAppend,
		remove: votePercentRemove,
	} = useFieldArray({ control, name: "votePercent" });

	const { append: votePercentNumAppend, remove: votePercentNumRemove } =
		useFieldArray({ control, name: "votePercentNum" });

	const { append: rangeAppend, remove: rangeRemove } = useFieldArray({
		control,
		name: "range",
	});

	const { append: rangeNumAppend, remove: rangeNumRemove } = useFieldArray({
		control,
		name: "rangeNum",
	});

	const outcomeChoiceRef: any = useRef();
	const [outcomeKeys, SetOutcomeKeys] = useState<number[]>([]);

	// Form submit of proposal properties
	const OnFormSubmit = async (value: any) => {
		let OutcomeData = {
			type: proposalType,
			data: ''
		}

		if (proposalType === 'single-choice' || proposalType === 'basic') OutcomeData.data = value.singleValue;
		else if (proposalType === 'quadratic' || proposalType === 'weighted') {
			let outcomeAmount: any = [];
			let formEL = outcomeChoiceRef.current;
			outcomeKeys.forEach((key) => {
				let itemData: any = { value: 0, amount: 0 };
				itemData.value = voteOption[key].display;
				itemData.amount = formEL['voteAmount' + key].value;
				outcomeAmount.push(itemData);
			})
			OutcomeData.data = JSON.stringify(outcomeAmount);
		} else {
			let ranked: string[] = [];
			outcomeKeys.forEach((key: number) => { ranked.push(voteOption[key].display); })
			OutcomeData.data = JSON.stringify(ranked);
		}
		value.desiredVote = JSON.stringify(OutcomeData);
		if (proposalType == "ranked-choice") {
			if (outcomeKeys.length != voteOption.length) {
				NotificationManager.warning(
					"You must select all options for vote to this proposal!",
					"Warning"
				);
				return;
			}
		}
		if (walletAddress === "") {
			NotificationManager.warning("Please connect wallet...!", "Warning");
		} else if (value.snapshotProposal === "") {
			NotificationManager.warning(
				"Please select a proposal on snapshot!",
				"Warning"
			);
		} else if (value.desiredVote === "") {
			NotificationManager.warning("Please select a choice!", "Warning");
		} else {
			setMyLoading(true);
			let signer: any = provider?.getSigner();
			let result: any;
			if (prsalType == "variable") {
				result = await createVariable({
					address: address,
					walletAddress: walletAddress,
					value: value,
					submitType: submitType,
					signer: signer,
					chain: chainName,
				});
			} else {
				result = await createProposal({
					address: address,
					walletAddress: walletAddress,
					value: value,
					submitType: submitType,
					signer: signer,
					chain: chainName,
				});
			}
			if (!result.status) {
				NotificationManager.warning(result.message, "Warning");
			} else {
				NotificationManager.success(result.message, "Success");
				if (submitType) navigate(`/proposal/${props.name}`);
				setSubmitType(!submitType);
			}
			setMyLoading(false);
		}
	};

	const isGovernance = prsalType === "governance";
	const isFixed = prsalType === "fixed";
	const isVariable = !isGovernance && !isFixed;

	const onAddGaugeVariable = () => {
		votePercentAppend({ value: 0 });
		votePercentNumAppend({ value: 0 });
		rangeAppend({ value: [0, 10] });
		rangeNumAppend({ value: [0, 10] });
		// payoutAppend(0);
	};

	const onDeleteGaugeVariable = (idx?: number | number[]) => {
		votePercentRemove(idx);
		votePercentNumRemove(idx);
		rangeRemove(idx);
		rangeNumRemove(idx);
		// payoutRemove(idx);
	};

	return (
		<Box
			className="flex flex-col gap-8 "
			component="form"
			autoComplete="off"
			onSubmit={handleSubmit(OnFormSubmit)}
		>
			<Box className="grid md:grid-cols-3 gap-8">
				<Box className="flex flex-col md:col-span-2 gap-12">
					<BoxForm className="flex flex-col p-8 md:p-20 rounded-md  gap-8">
						<FormSelect
							label="Snapshot Proposal"
							placeholder="Choose a snashot proposal"
							items={snapshot}
							name="snapshotProposal"
							setVote={ClickSnap}
							control={control}
						/>
						{isGovernance && (
							<FormSelect
								label="Desired Vote Outcome"
								placeholder="Choose desired vote outcome"
								items={voteOption}
								name="desiredVote"
								control={control}
							/>
						)}
						<FormTextField
							label="Proposal Name"
							name="proposalName"
							control={control}
							placeholder=""
						/>
						<FormTextField
							label="Proposal Description"
							name="proposalDescription"
							control={control}
						/>
						<FormTextField
							label="Proposal End Time"
							name="endTime"
							control={control}
							time={time}
							readonly={true}
						/>
					</BoxForm>
					{
						voteOption.length > 0 && (

							<BoxForm className="flex flex-col p-8 md:p-20 rounded-md  gap-8">
								{
									proposalType == "single-choice" || proposalType == "basic" ? (
										<FormSelect
											label="Outcome Choice"
											placeholder="Choose a Choice"
											items={voteOption}
											name="singleValue"
											control={control}
										/>
									) : proposalType == "quadratic" || proposalType == "weighted" ? (
										<OutcomeChoiceForm voteOption={voteOption} formRef={outcomeChoiceRef} SetKeysEvent={SetOutcomeKeys} />
									) : (
										<MultiChoiceForm voteOption={voteOption} formRef={outcomeChoiceRef} VoteType={proposalType} SetKeysEvent={SetOutcomeKeys} />
									)
								}
							</BoxForm>
						)
					}

					<BoxForm className="flex flex-col p-8 md:p-20 rounded-md gap-8">
						{votePercentFields.map((vp, idx) => (
							<Box
								key={vp.id}
								className={classNames(
									"flex flex-col gap-8",
								)}
							>
								{isVariable ? (
									<Box
										className={classNames(
											"flex flex-col gap-8"
										)}
									>
										<FormSelect
											label="Reward Currency"
											placeholder="Choose your reward currency"
											items={Tokens[chainName]}
											setReward={setRewardType}
											setClickToken={clickToken}
											name="rewardCurrency"
											control={control}
										/>
										<FormTextField
											label="Min Reward"
											name="minReward"
											control={control}
											textType="number"
											setrewardAmount={setMinReward}
											index={idx}
											placeholder={
												isGovernance
													? "The maximum amount that will be paid out when the vote concludes"
													: "Enter payout in reward currency per vote percent"
											}
										/>
										<FormTextField
											label="Min Votes"
											name="minVotes"
											setrewardAmount={setMinVotes}
											control={control}
											textType="number"
											index={idx}
											placeholder={
												isGovernance
													? "The maximum amount that will be paid out when the vote concludes"
													: "Enter amount of Min votes"
											}
										/>
										<FormTextField
											label="Target Votes"
											name="targetVotes"
											control={control}
											textType="number"
											setrewardAmount={setTargetVotes}
											index={idx}
											placeholder={
												isGovernance
													? "The maximum amount that will be paid out when the vote concludes"
													: "Enter amount of Target Votes"
											}
										/>
									</Box>
								) : (
									<Box
										className={classNames(
											"flex flex-col gap-8"
										)}
									>

										<FormSelect
											label="Reward Currency"
											placeholder="Choose your reward currency"
											items={Tokens[chainName]}
											setReward={setRewardType}
											setClickToken={clickToken}
											name="rewardCurrency"
											control={control}
										/>
										<FormTextField
											label="Max Reward"
											name="payout"
											control={control}
											textType="number"
											setrewardAmount={setMaxReward}
											index={idx}
											placeholder={
												isGovernance
													? "The maximum amount that will be paid out when the vote concludes"
													: "Enter payout in reward currency per vote percent"
											}
										/>
									</Box>
								)}
							</Box>
						))}
						{/* {!isGovernance && !isFixed && (
              <Box className="flex justify-end">
                <Button
                  variant="contained"
                  color="tealLight"
                  type="button"
                  onClick={onAddGaugeVariable}
                >
                  Add
                </Button>
              </Box>
            )} */}
					</BoxForm>
					<Box className="mb-10 md:mb-20 flex justify-end"></Box>
				</Box>
				<Box>
					<BoxForm className="flex flex-col p-8 md:p-12 rounded-md gap-8 mb-12 md:mb-0">
						<strong className="feehed">Total proposal value</strong>
						<Box className="flex flex-col gap-8">
							<Box className="grid grid-cols-3 gap-8">
								<Typography className="feetitle col-span-2">
									Max Reward
								</Typography>
								{isVariable ? (
									<Typography className="text-right">
										{minVotes == 0 ? (
											<>
												0 < br />
												$0
											</>
										) : (
											<>
												{NumberType((minReward * targetVotes / minVotes).toFixed(2), 2) + " " + rewardType}
												<br />${NumberType((minReward * targetVotes / minVotes * usd).toFixed(2), 2)}
											</>
										)}
									</Typography>
								) : (
									<Typography className="text-right">
										{maxReward + " " + rewardType}
										<br />${NumberType((maxReward * usd).toFixed(2), 2)}
									</Typography>
								)}
								<Typography className="col-span-2">Lobbyist Fee</Typography>
								<Typography className="text-right">
									2.5%
									<br />
									{isVariable ? (
										<>
											{minVotes == 0 ? (
												<>
													$0
												</>
											) : (
												<>
													${NumberType((minReward * targetVotes / minVotes * 0.025 * usd).toFixed(2), 2)}
												</>
											)}
										</>
									) :
										<>
											${NumberType((maxReward * 0.025 * usd).toFixed(2), 2)}
										</>
									}
								</Typography>
							</Box>
							<Typography className="feename">
								The fee will be deducted from the Max Reward on deposit
							</Typography>
						</Box>
						{myloading ? (
							<Button variant="contained" color="tealLight">
								<img style={{ width: "25px" }} alt="" src={loader}></img>
							</Button>
						) : submitType ? (
							<Button variant="contained" color="tealLight" type="submit">
								Submit
							</Button>
						) : (
							<Button variant="contained" color="tealLight" type="submit">
								Approve
							</Button>
						)}
					</BoxForm>
				</Box>
			</Box>
		</Box>
	);
};

export { ProposalForm };
