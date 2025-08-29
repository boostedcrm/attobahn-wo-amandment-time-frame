// EmailInputField.js
import React, { useState } from "react";
import styled from "styled-components";

const EmailInputContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
  border: 1px solid #d1d1d1;
  border-radius: 5px;
  min-height: 23px;
  max-width: 600px;
`;

const EmailChip = styled.div`
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
`;

const RemoveButton = styled.span`
  cursor: pointer;
  color: #d32f2f;
  font-weight: bold;
  &:hover {
    color: #f44336;
  }
`;

const InputField = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 12px;
  margin: 0;
`;

const EmailInputField = ({ emails = [], onEmailsChange }) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      if (inputValue && validateEmail(inputValue.trim())) {
        onEmailsChange([...emails, inputValue.trim()]);
        setInputValue("");
        setError("");
      } else {
        setError("Invalid email address");
      }
    } else if (e.key === "Backspace" && !inputValue && emails.length > 0) {
      const updatedEmails = [...emails];
      updatedEmails.pop();
      onEmailsChange(updatedEmails);
    }
  };

  const handleRemoveEmail = (index) => {
    const updatedEmails = emails.filter((_, i) => i !== index);
    onEmailsChange(updatedEmails);
  };

  return (
    <>
      <EmailInputContainer>
        {emails?.map((email, index) => (
          <EmailChip key={index}>
            {email}
            <RemoveButton onClick={() => handleRemoveEmail(index)}>
              ×
            </RemoveButton>
          </EmailChip>
        ))}
        <InputField
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add an Email"
        />
      </EmailInputContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </>
  );
};

export default EmailInputField;
