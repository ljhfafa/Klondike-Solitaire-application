"use strict";

import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import styled from "styled-components";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Header } from "./components/header.js";
import { Landing } from "./components/landing.js";
import { Login } from "./components/login.js";
import { Logout } from "./components/logout.js";
import { Register } from "./components/register.js";
import { Profile } from "./components/profile.js";
import { EditProfile } from "./components/edit-profile.js";
import { Start } from "./components/start.js";
import { Results } from "./components/results.js";
import { Game } from "./components/game.js";

const defaultUser = {
  username: "",
  first_name: "",
  last_name: "",
  primary_email: "",
  city: "",
  games: [],
};

const GridBase = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    "hd"
    "main"
    "ft";

  @media (min-width: 500px) {
    grid-template-columns: 40px 50px 1fr 50px 40px;
    grid-template-rows: auto auto auto;
    grid-template-areas:
      "hd hd hd hd hd"
      "sb sb main main main"
      "ft ft ft ft ft";
  }
`;

const ReqUser = ({ user, children }) =>
  !user || user.username === "" ? (
    <Navigate to={"/login"} replace={true} />
  ) : (
    children
  );

const CheckRegister = ({ loggedIn, username }) =>
  loggedIn ? (
    <Navigate to={`/profile/${username}`} replace={true} />
  ) : (
    <Register />
  );

const MyApp = () => {
  const data = localStorage.getItem("user");
  let [state, setState] = useState(data ? JSON.parse(data) : defaultUser);
  console.log(`Starting as user: ${state.username}`);

  const loggedIn = () => {
    return state.username && state.primary_email;
  };

  const logIn = async (username) => {
    const response = await fetch(`/v1/user/${username}`);
    const user = await response.json();
    localStorage.setItem("user", JSON.stringify(user));
    setState(user);
  };

  const logOut = () => {
    localStorage.removeItem("user");
    setState(defaultUser);
  };

  return (
    <BrowserRouter>
      <GridBase>
        <Header user={state.username} email={state.primary_email} />
        <Routes>
          <Route exact path="/" element={<Landing />} />
          <Route path="/login" element={<Login logIn={logIn} />} />
          <Route path="/logout" element={<Logout logOut={logOut} />} />
          <Route
            path="/register"
            element={
              <CheckRegister loggedIn={loggedIn()} username={state.username} />
            }
          />
          <Route
            path="/profile/:username"
            element={<Profile currentUser={state.username} />}
          />
          <Route
            path="/edit"
            element={
              <ReqUser user={state}>
                <EditProfile onUpdate={logIn} />
              </ReqUser>
            }
          />
          <Route
            path="/start"
            element={
              <ReqUser user={state}>
                <Start />
              </ReqUser>
            }
          />
          <Route path="/game/:id" element={<Game user={state} />} />
          <Route path="/results/:id" element={<Results user={state} />} />
        </Routes>
      </GridBase>
    </BrowserRouter>
  );
};

const root = createRoot(document.getElementById("mainDiv"));
root.render(<MyApp />);
