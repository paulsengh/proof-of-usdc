import React, { useEffect, useState } from "react";
// @ts-ignore
import { useMount, useUpdateEffect } from "react-use";
import styled from "styled-components";
import _ from "lodash";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import {
  downloadProofFiles,
  generateProof,
  verifyProof,
} from "@zk-email/helpers/dist/chunked-zkey";
import { abi } from "../abi.json";
import {
  generateTwitterVerifierCircuitInputs,
  ITwitterCircuitInputs,
} from "@proof-of-twitter/circuits/helpers";
import { LabeledTextArea } from "../components/LabeledTextArea";
import DragAndDropTextBox from "../components/DragAndDropTextBox";
import { SingleLineInput } from "../components/SingleLineInput";
import { Button, TextButton } from "../components/Button";
import { Col, Row } from "../components/Layout";
import { NumberedStep } from "../components/NumberedStep";
import { TopBanner } from "../components/TopBanner";
import { ProgressBar } from "../components/ProgressBar";
import useGoogleAuth from "../hooks/useGoogleAuth";
import {
  RawEmailResponse,
  fetchEmailList,
  fetchEmailsRaw,
} from "../hooks/useGmailClient";
import { formatDateTime } from "../helpers/dateTimeFormat";
import EmailInputMethod from "../components/EmailInputMethod";

const CIRCUIT_NAME = "twitter";

export const MainPage: React.FC<{}> = (props) => {
  return <h1 className="text-3xl font-bold underline">Hello world!</h1>;
};
