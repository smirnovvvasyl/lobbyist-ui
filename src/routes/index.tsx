import { FC } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import HomePage from "../pages/home";
import All from "../pages/total";
import ProposalNewPage from "../pages/proposalNew";
import ProposalSymbolPage from "../pages/proposalSymbol";
import ProposalSymbolVotePage from "../pages/proposalSymbolVote";
import { ReactApp } from "../components";
import NotPage from "../pages/NotPage";

const { PUBLIC_URL } = process.env;

const AppRoutes: FC = () => {
  return (
    <BrowserRouter basename={PUBLIC_URL}>
      <Routes>
        <Route element={<ReactApp />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/:id" element={<All />} />
          <Route path="/proposal/new" element={<ProposalNewPage />} />
          <Route path="/proposal/new/:protocol" element={<ProposalNewPage />} />
          <Route path="/proposal/new/:protocol/:prsalType" element={<ProposalNewPage />} />
          <Route path="/proposal/new/:protocol/:prsalType/:kpi" element={<ProposalNewPage />} />
          <Route path="/proposal/new/:protocol/:prsalType/:kpi/:status" element={<ProposalNewPage />} />
          <Route path="/proposal/:symbol" element={<ProposalSymbolPage />} />
          <Route path="/proposal/:symbol/vote" element={<ProposalSymbolVotePage />} />
        </Route>
        <Route path="*" element={<NotPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export { AppRoutes };
