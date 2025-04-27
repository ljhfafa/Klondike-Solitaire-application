/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

import React from "react";
import styled from "styled-components";

const LandingBase = styled.div`
  display: flex;
  justify-content: center;
  grid-area: main;
`;

export const Landing = () => (
  <LandingBase>
    <h1>This is my landing page!</h1>
    <h1>1.deploy with HTTPS</h1>
    <h1>2.Enable modification of a user's profile</h1>
    <h1>3.Autocomplete button. </h1>
  </LandingBase>
);
