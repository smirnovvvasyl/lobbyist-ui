import { Card, CardContent, Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Proposal } from "../../../@types/proposal";
import { Tokens } from "../../../token";
import { TextContent, TextHead } from "../../text";
import NumberType from "../../../common/number";

type Props = {
    proposal: Proposal;
};

const Content = styled(CardContent)(({ theme }) => ({
    backgroundColor: theme.palette.secondary.main,
}));

const ProposalCardTargetVotes = ({ proposal }: Props) => {
    var rewardCurrency = Tokens[proposal.chain].filter(
        (token: any) => token.address == proposal.rewardCurrency
    );
    const colHeads = ["Max Rewards", "Target Votes"];
    return (
        <Card className="" elevation={0}>
            <Content className="card-rnd">
                <Box className="grid grid-cols-2 gap-8">
                    {colHeads.map((c, idx) => (
                        <Box key={`colHead_${idx}`}>
                            <TextHead>{c}</TextHead>
                        </Box>
                    ))}
                </Box>
                <Box className="grid grid-cols-2 gap-8">
                    <Typography variant="subtitle1">
                        ${NumberType(proposal.usdAmount.toFixed(2), 2)}
                    </Typography>
                    <Typography variant="subtitle1">{proposal.targetVotes}</Typography>
                </Box>
                <Box className="grid grid-cols-2 gap-8" style={{ color: "#3a78ff" }}>
                    <Typography variant="subtitle1">
                        {NumberType(proposal.reward.toFixed(2), 2) +
                            " " +
                            rewardCurrency[0].display}
                    </Typography>
                </Box>
            </Content>
        </Card>
    );
};

ProposalCardTargetVotes.defaultProps = {
    isProposer: false,
};

export { ProposalCardTargetVotes };
