import {
  Box,
  Button,
  CircularProgress,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import React, { useEffect, useState } from "react";
import logo from "./auttobahn.png";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ZOHO = window.ZOHO;

function App() {
  const [initailLoading, setInitialLoading] = useState(true);
  const [entity, setEntity] = useState();
  const [entityId, setEntityId] = useState();
  const [recordData, setRecordData] = useState();
  const [effectiveDate, setEffectiveDate] = useState(null);
  const [newEndDate, setNewEndDate] = useState();
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("error");

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  useEffect(() => {
    ZOHO.embeddedApp.on("PageLoad", async function (data) {
      setEntity(data?.Entity);
      setEntityId(data?.EntityId);
      await ZOHO.CRM.API.getRecord({
        Entity: data?.Entity,
        RecordID: data?.EntityId,
      }).then(async function (data) {
        let resp = data?.data[0];
        setRecordData(resp);
        setNewEndDate(resp?.New_End_Date ? resp?.New_End_Date : null);
        setEffectiveDate(resp?.Effective_Date ? resp?.Effective_Date : null);
        setInitialLoading(false);
      });

      ZOHO.CRM.UI.Resize({ height: "400", width: "900" }).then(function (data) {
        // console.log(data);
      });
    });

    ZOHO.embeddedApp.init().then(() => {});
  }, []);

  const handleUpdate = async () => {
    try {
      if (!effectiveDate) {
        setSeverity("error");
        setSnackbarMessage(
          "Please select Amendment Effective Date. It is required."
        );
        setOpenSnackbar(true);
        return;
      }
      if (recordData?.Work_Order_End_Date === newEndDate) {
        setSeverity("error");
        setSnackbarMessage(
          "Current Work Order End Date and New End Date cannot be same."
        );
        setOpenSnackbar(true);
        return;
      }
      setLoading(true);
      const config = {
        Entity: entity,
        APIData: {
          id: entityId,
          Effective_Date: effectiveDate,
          New_End_Date: newEndDate,
        },
        Trigger: [],
      };
      await ZOHO.CRM.API.updateRecord(config).then(async function (data) {
        if (data?.data[0]?.message === "record updated") {
          setSeverity("success");
          setSnackbarMessage("Updated Successfully..");
          setOpenSnackbar(true);
          setTimeout(() => {
            ZOHO.CRM.UI.Popup.closeReload().then(function (data) {
              console.log(data);
            });
          }, 2000);
        } else {
          setLoading(false);
          setSeverity("error");
          setSnackbarMessage("Something went wrong..Please try again later!!!");
          setOpenSnackbar(true);
        }
      });
    } catch (err) {
      setLoading(false);
      setSeverity("error");
      setSnackbarMessage(
        err?.message || "Something went wrong..Please try again later!!!"
      );
      setOpenSnackbar(true);
    }
  };

  const handleCancel = () => {
    ZOHO.CRM.UI.Popup.close().then(function (data) {});
  };

  return (
    <>
      <Box>
        {initailLoading ? (
          <Box
            sx={{
              textAlign: "center",
              mt: 13,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ mt: 1, textAlign: "center", mb: 1 }}>
              <img src={logo} alt="logo" />
            </Box>
            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography>
                Please enter the Effective date for this amendment (Required)
                and if you are extending the date through which this work will
                be performed, Please select a new work order end date:{" "}
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Amendment Effective Date"
                  inputProps={{
                    style: {
                      height: 18,
                    },
                  }}
                  value={effectiveDate}
                  onChange={(newValue) => {
                    setEffectiveDate(dayjs(newValue).format("YYYY-MM-DD"));
                  }}
                  PopperProps={{
                    placement: "right-end",
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      sx={{ width: 220, mt: 5 }}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="New End Date"
                  inputProps={{
                    style: {
                      height: 18,
                    },
                  }}
                  value={newEndDate}
                  onChange={(newValue) => {
                    setNewEndDate(dayjs(newValue).format("YYYY-MM-DD"));
                  }}
                  PopperProps={{
                    placement: "right-end",
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={{ width: 220, mt: 2 }}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: "1rem",
                mt: 3,
              }}
            >
              <Button
                sx={{ width: 160 }}
                variant="outlined"
                size="small"
                disabled={loading}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                sx={{ width: 160 }}
                onClick={handleUpdate}
                disabled={loading}
                variant="contained"
                size="small"
              >
                {loading ? <CircularProgress size={20} /> : "Update"}
              </Button>
            </Box>
            <Snackbar
              open={openSnackbar}
              autoHideDuration={4500}
              onClose={handleCloseSnackbar}
            >
              <Alert
                onClose={handleCloseSnackbar}
                severity={severity}
                sx={{ width: "100%" }}
              >
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </>
        )}
      </Box>
    </>
  );
}

export default App;
