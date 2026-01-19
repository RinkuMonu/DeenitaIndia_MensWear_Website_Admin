import { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Grid,
  Snackbar,
  SnackbarContent,
  IconButton,
  Box,
  Typography,
  FormControlLabel,
  Switch
} from "@mui/material";
import { apiPost, apiPut } from "../../../api/apiMethods";
import { EditNoteOutlined } from "@mui/icons-material";
import { useUser } from "../../../Context/UserContext";
import AddIcon from "@mui/icons-material/Add";

const BrandForm = ({ dataHandler, initialData }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [referenceWebsite, setReferenceWebsite] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const { user } = useUser();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setReferenceWebsite(initialData.referenceWebsite || "");
      setIsActive(initialData.isActive ?? true);
      setLogoPreview(initialData.logo ? `https://api.deenitaindia.com${initialData.logo}` : "");
    } else {
      resetForm();
    }
  }, [initialData]);

  useEffect(() => {
    if (user && !initialData) {
      setReferenceWebsite(user.referenceWebsite || "");
    }
  }, [user, initialData]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setLogoFile(null);
    setLogoPreview("");
    setIsActive(true);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!name || !referenceWebsite) {
      setSnackbarMessage("Brand Name is required");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("referenceWebsite", referenceWebsite);
    formData.append("isActive", isActive);
    
    if (logoFile) {
      formData.append("logo", logoFile); // Backend 'logo' field check karega
    }

    try {
      let response;
      if (initialData) {
        response = await apiPut(`api/brands/${initialData._id}`, formData);
      } else {
        response = await apiPost("api/brands", formData);
      }

      if (response.status === 200 || response.status === 201) {
        setSnackbarMessage(initialData ? "Brand Updated" : "Brand Created Successfully");
        setSnackbarSeverity("success");
        setOpen(false);
        dataHandler();
        if(!initialData) resetForm();
      }
    } catch (error) {
      setSnackbarMessage(error.response?.data?.message || "Operation failed");
      setSnackbarSeverity("error");
    }
    setSnackbarOpen(true);
  };

  return (
    <div>
      {initialData ? (
        <IconButton onClick={() => setOpen(true)}><EditNoteOutlined /></IconButton>
      ) : (
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Add New Brand
        </Button>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: "#872d67", fontWeight: "bold" }}>
          {initialData ? "Edit Brand" : "Create New Brand"}
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Brand Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Brand Logo</Typography>
              <input type="file" accept="image/*" onChange={handleLogoUpload} />
              {logoPreview && (
                <Box mt={2}>
                  <img src={logoPreview} alt="Logo Preview" style={{ width: 100, height: 100, objectFit: "contain", border: "1px solid #ddd" }} />
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
                label="Active Status"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {initialData ? "Update Brand" : "Save Brand"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <SnackbarContent 
          message={snackbarMessage} 
          style={{ backgroundColor: snackbarSeverity === "success" ? "#2e7d32" : "#d32f2f" }} 
        />
      </Snackbar>
    </div>
  );
};

export default BrandForm;