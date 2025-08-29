// Email.js
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import EmailInputField from "./EmailInputField";
import "./Email.css";

export default function Email({
  vendorResp,
  handleClose,
  sendDraftLoading,
  handleSendDraft,
}) {
  const [value, setValue] = useState([]);
  const [subject, setSubject] = useState(
    `Attobahn's standard ${
      vendorResp?.Vendor_Type_New === "Independent Contractor"
        ? "Consulting Agreement"
        : "MSA"
    } attached`
  );
  const [emailContent, setEmailContent] = useState(
    `Please review the attached ${
      vendorResp?.Vendor_Type_New === "Independent Contractor"
        ? "Consulting Agreement"
        : "MSA"
    }. Let me know if you are ok with the terms and I will have the finalized version sent to ${
      vendorResp?.Primary_Contact_First_Name
    } ${vendorResp?.Primary_Contact_Last_Name} at ${
      vendorResp?.Primary_Contact_Email
    } for electronic signature`
  );

  useEffect(() => {
    let contactEmail = vendorResp?.Contact_Email;
    let signerEmail = vendorResp?.Primary_Contact_Email;
    if (signerEmail === contactEmail) {
      setValue([signerEmail]);
    } else {
      setValue([contactEmail, signerEmail]);
    }
  }, [vendorResp]);

  return (
    <Box sx={{ width: 500 }}>
      <EmailInputField emails={value} onEmailsChange={setValue} />

      <TextField
        required
        fullWidth
        size="small"
        id="outlined-basic"
        label="Subject"
        sx={{ my: 2 }}
        value={subject}
        onChange={(e) => {
          setSubject(e.target.value);
        }}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        required
        fullWidth
        multiline
        minRows={12}
        maxRows={12}
        size="small"
        id="outlined-basic"
        label="Email Body"
        value={emailContent}
        onChange={(e) => {
          setEmailContent(e.target.value);
        }}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
      />

      <Box sx={{ display: "flex", mt: 2, justifyContent: "flex-end" }}>
        <Button
          onClick={handleClose}
          sx={{ height: 30, width: 120, mr: 2 }}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={() =>
            handleSendDraft({
              recepient: value,
              subject: subject,
              emailContent: emailContent,
            })
          }
          disabled={
            value?.length && subject && emailContent && !sendDraftLoading
              ? false
              : true
          }
          sx={{ height: 30, width: 140 }}
          variant="contained"
        >
          {sendDraftLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Send Email"
          )}
        </Button>
      </Box>
    </Box>
  );
}
