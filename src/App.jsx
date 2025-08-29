import {
  Box,
  Button,
  CircularProgress,
  Snackbar,
  TextField,
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
        setNewEndDate(
          resp?.New_End_Date ? resp?.New_End_Date : resp?.Work_Order_End_Date
        );
        setInitialLoading(false);
      });

      ZOHO.CRM.UI.Resize({ height: "500", width: "900" }).then(function (data) {
        // console.log(data);
      });
    });

    ZOHO.embeddedApp.init().then(() => {});
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    const config = {
      Entity: entity,
      APIData: {
        id: entityId,
        Request_MSA: true,
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
              sx={{ width: "100%", display: "flex", justifyContent: "center" }}
            >
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
                      required
                      sx={{ width: 220, my: 5 }}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Box>

            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                gap: "1rem",
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
