"use strict";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import styled from "styled-components";
import {
  ErrorMessage,
  FormBase,
  FormLabel,
  FormInput,
  FormButton,
} from "./shared.js";

const EditProfileBase = styled.div`
  grid-area: main;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2em;
`;

const EditForm = styled(FormBase)`
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 1em;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1em;
  justify-content: center;
  margin-top: 1em;
`;

const Title = styled.h2`
  margin-bottom: 1em;
`;

export const EditProfile = ({ onUpdate }) => {
  const navigate = useNavigate();
  const [state, setState] = useState({
    username: "",
    first_name: "",
    last_name: "",
    city: "",
    error: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) {
          throw new Error("User data not found");
        }
        const user = JSON.parse(userData);
        setState((prevState) => ({
          ...prevState,
          username: user.username,
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          city: user.city || "",
        }));
      } catch (err) {
        setState((prevState) => ({ ...prevState, error: err.message }));
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/v1/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: state.first_name,
          last_name: state.last_name,
          city: state.city,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      if (onUpdate) {
        await onUpdate(state.username);
      }

      navigate(`/profile/${state.username}`);
    } catch (err) {
      setState((prevState) => ({ ...prevState, error: err.message }));
    }
  };

  return (
    <EditProfileBase>
      <Title>Edit Profile</Title>
      <ErrorMessage msg={state.error} />
      <EditForm onSubmit={handleSubmit}>
        <FormLabel>
          First Name:
          <FormInput
            name="first_name"
            value={state.first_name}
            onChange={handleChange}
          />
        </FormLabel>
        <FormLabel>
          Last Name:
          <FormInput
            name="last_name"
            value={state.last_name}
            onChange={handleChange}
          />
        </FormLabel>
        <FormLabel>
          City:
          <FormInput name="city" value={state.city} onChange={handleChange} />
        </FormLabel>
        <ButtonGroup>
          <FormButton type="submit">Save Changes</FormButton>
          <FormButton
            type="button"
            onClick={() => navigate(`/profile/${state.username}`)}
          >
            Cancel
          </FormButton>
        </ButtonGroup>
      </EditForm>
    </EditProfileBase>
  );
};

EditProfile.propTypes = {
  onUpdate: PropTypes.func,
};
