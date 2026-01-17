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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Box,Typography,
} from "@mui/material";
import { apiPost, apiPut } from "../../../api/apiMethods";
import { EditNoteOutlined } from "@mui/icons-material";
import { useUser } from "../../../Context/UserContext";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { makeStyles } from "@mui/styles";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { Checkbox, FormControlLabel } from "@mui/material";
const useStyles = makeStyles({
  selectInput: {
    minWidth: 200,
    fontSize: "14px",
  },
});

const ProductForm = ({ dataHandler, initialData, websites, addCategory }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [sizes, setSizes] = useState([{ sizes: "", price: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [referenceWebsite, setReferenceWebsite] = useState("");
  const [category, setCategory] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [material, setMaterial] = useState("");
  const [inStock, setInStock] = useState(0);
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryPreview, setCategoryPreview] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [tags, setTags] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [subcategory, setSubCategory] = useState("");
  const { user, categories } = useUser();

  useEffect(() => {
    if (initialData) {
      setProductName(initialData?.productName || "");
      setDescription(initialData.description || "");
      setPrice(initialData?.price || 0);
      setSizes(
        Array.isArray(initialData?.size) && initialData.size.length > 0
          ? initialData.size.map((item) => ({
              sizes: item.sizes || "",
              price: item.price || 0,
            }))
          : [{ sizes: "", price: 0 }]
      );
      setDiscount(initialData?.discount || 0);
      setReferenceWebsite(initialData?.referenceWebsite || "");
      setCategory(initialData?.category?._id || "");
      setMaterial(initialData?.material || "");
      setPreviewImages(
        initialData?.images?.map(
          // (img) => `https://api.jajamblockprints.com${img}`
          (img) => `https://api.deenitaindia.com${img}`
        ) || []
      );
      setInStock(initialData?.stock || 0);
      setIsPopular(!!initialData?.isPopular);
      setIsTrending(!!initialData?.isTrending);
      setIsFeatured(!!initialData?.isFeatured);
      setIsNewArrival(initialData?.isNewArrival ?? true);

      if (Array.isArray(initialData?.tags)) {
        setTags(initialData.tags.join(", "));
      } else {
        setTags(""); 
      }
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
    setProductName("");
    setDescription("");
    setPrice(0);
    setSizes([{ sizes: "", price: 0 }]);
    setDiscount(0);
    setReferenceWebsite("");
    setCategory("");
    setSubCategory("");
    setMaterial("");
    setImageFiles([]);
    setPreviewImages([]);
    setCategoryImage(null);
    setCategoryPreview("");
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleCategoryImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryImage(file);
      setCategoryPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    // Debug 1: Check initial states

    const cleanedSizes = Array.isArray(sizes)
      ? sizes.filter((s) => s.sizes.trim() !== "" && s.price > 0)
      : [];

    // Validation logic with detailed console logging
    const isCategoryInvalid = addCategory && (!productName || !categoryImage);
    const isProductInvalid = !addCategory && (
        !productName || 
        !description || 
        (!initialData && imageFiles.length === 0) || 
        !referenceWebsite || 
        !category
    );

    if (isCategoryInvalid || isProductInvalid) {
      // Debug 2: Validation failed details
      console.warn("Validation Failed. Current State:", {
        productName,
        category,
        description,
        referenceWebsite,
        imageCount: imageFiles.length,
        categoryImage: !!categoryImage,
        cleanedSizes
      });
      
      setSnackbarMessage("Please fill all required fields");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    // Debug 3: Log data being appended

    if (addCategory) {
      formData.append("name", productName);
      formData.append("subcategory", subcategory);
      if (description) formData.append("description", description);
      if (referenceWebsite) formData.append("referenceWebsite", referenceWebsite);
      formData.append("images", categoryImage);
    } else {
      formData.append("productName", productName);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("actualPrice", ((price * (100 - discount)) / 100).toFixed(2));
      formData.append("discount", discount);
      formData.append("size", JSON.stringify(cleanedSizes));
      formData.append("referenceWebsite", referenceWebsite);
      formData.append("category", category);
      formData.append("material", material);
      formData.append("stock", inStock);
      formData.append("isPopular", isPopular);
      formData.append("isTrending", isTrending);
      formData.append("isFeatured", isFeatured);
      formData.append("isNewArrival", isNewArrival);
      imageFiles.forEach((file, index) => {
        formData.append("images", file);
      });
    }

    try {
      let response;
      if (initialData) {
        response = await apiPut(`api/product/products/${initialData._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (addCategory) {
        response = await apiPost("api/categories", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await apiPost("api/product/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // Debug 4: Response status check

      if (response.status === 200 || response.status === 201) {
        setSnackbarMessage(addCategory ? "Category created successfully" : "Product saved successfully");
        setSnackbarSeverity("success");
        setOpen(false);
        dataHandler();
      } else {
        // Agar response status 200 nahi hai
        console.error("Non-200 Response Received:", response);
      }
    } catch (error) {
      // Debug 5: Comprehensive Error Logging
      console.error("Critical Submission Error:");
      if (error.response) {
        // Server ne respond kiya lekin error code ke saath
        console.error("Backend Error Data:", error.response.data);
        console.error("Backend Status Code:", error.response.status);
      } else if (error.request) {
        // Request bhej di gayi par response nahi mila (Network issue)
        console.error("No response received from server. Check Network/CORS.");
      } else {
        // Request setup karte waqt error aayi
        console.error("Request Setup Error:", error.message);
      }
      
      setSnackbarMessage(error.response?.data?.message || "Failed to save");
      setSnackbarSeverity("error");
    }

    setSnackbarOpen(true);
  };
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const [groupedCategories, setGroupedCategories] = useState({});

  useEffect(() => {
    const referenceWebsite = "6968869bd31f93ad3cd05004";
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          // `https://api.jajamblockprints.com/api/website/${referenceWebsite}`
          `https://api.deenitaindia.com/api/website/${referenceWebsite}`
        );
        const data = await res.json();

        // Group items by subcategory
        const grouped = {};
        if (Array.isArray(data?.website?.categories)) {
          data?.website?.categories.forEach((item) => {
            const sub = item?.subcategory;
            if (!grouped[sub]) grouped[sub] = [];
            grouped[sub].push(item);
          });
        }

        setGroupedCategories(grouped);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, [referenceWebsite]);

  return (
    <div>
      {initialData ? (
        <IconButton onClick={handleClickOpen}>
          <EditNoteOutlined />
        </IconButton>
      ) : user && (user.role === "admin" || user.role === "vendor") ? (
        <Button sx={{ px: 2, py: 1 }} color="primary" onClick={handleClickOpen}>
          <AddIcon /> {addCategory ? "Add Category" : "New Product"}
        </Button>
      ) : null}

      <Dialog
        open={open}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: { width: "900px", maxWidth: "90vw" },
        }}
        onClose={handleClose}
      >
        <DialogTitle sx={{ color: "#872d67" }}>
          {initialData
            ? "Update Product"
            : addCategory
            ? "Add Category"
            : "New Product"}
        </DialogTitle>

        <DialogContent>
  <Grid container spacing={2} sx={{ width: "100%" }}>
    <Grid item xs={12}>
      <TextField
        fullWidth
        label={addCategory ? "Category Name" : "Product Name"}
        variant="outlined"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
      />
    </Grid>

    {addCategory && (
      <>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="subcategory-label">Add Sub Category</InputLabel>
            <Select
              labelId="subcategory-label"
              value={subcategory}
              onChange={(e) => setSubCategory(e.target.value)}
            >
              {Object.keys(groupedCategories).map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description (optional)"
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <input
            type="file"
            accept="image/*"
            onChange={handleCategoryImageUpload}
            style={{ marginTop: 8 }}
          />
          {categoryPreview && (
            <img
              src={categoryPreview}
              alt="category-preview"
              style={{
                width: 80,
                height: 80,
                objectFit: "cover",
                borderRadius: 4,
                marginTop: 8,
              }}
            />
          )}
        </Grid>
      </>
    )}

    {!addCategory && (
      <>
        <Grid item xs={12}>
          <ReactQuill
            theme="snow"
            value={description}
            onChange={(value) => setDescription(value)}
            placeholder="Enter product description..."
            style={{ background: "#fff", borderRadius: 4 }}
          />
        </Grid>

        <Grid item xs={12}>
          <p className="text-red-500 text-sm font-medium mt-1">
            * You can select multiple images (Hold Ctrl/Cmd to select)
          </p>        
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{ marginTop: 8 }}
          />
          <Grid container spacing={1} sx={{ mt: 1 }}>
            {previewImages.map((img, idx) => (
              <Grid item key={idx}>
                <img
                  src={img}
                  alt={`preview-${idx}`}
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 4,
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Price"
            variant="outlined"
            type="text"
            inputProps={{ min: 0 }}
            value={price}
            onChange={(e) => {
              const value = Number(e.target.value);
              setPrice(value >= 0 ? value : 0);
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Material"
            variant="outlined"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <strong>Sizes & Prices</strong>
        </Grid>

        {Array.isArray(sizes) &&
          sizes.map((item, index) => (
            <Grid
              container
              spacing={1}
              key={index}
              alignItems="center"
              sx={{ mb: 1, ml: "2px" }}
            >
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Size"
                  variant="outlined"
                  value={item.sizes}
                  onChange={(e) => {
                    const updated = [...sizes];
                    updated[index].sizes = e.target.value;
                    setSizes(updated);
                  }}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Price"
                  variant="outlined"
                  type="text"
                  value={item.price}
                  onChange={(e) => {
                    const updated = [...sizes];
                    updated[index].price = Number(e.target.value);
                    setSizes(updated);
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton
                  onClick={() => {
                    if (index === sizes.length - 1) {
                      setSizes([...sizes, { sizes: "", price: 0 }]);
                    } else {
                      const filtered = sizes.filter((_, i) => i !== index);
                      setSizes(filtered.length ? filtered : [{ sizes: "", price: 0 }]);
                    }
                  }}
                >
                  {index === sizes.length - 1 ? <AddIcon /> : <DeleteIcon />}
                </IconButton>
              </Grid>
            </Grid>
          ))}

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Discount (%)"
            variant="outlined"
            type="text"
            inputProps={{ min: 0 }}
            value={discount}
            onChange={(e) => {
              const value = Number(e.target.value);
              setDiscount(value >= 0 ? value : 0);
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Stock Quantity"
            variant="outlined"
            type="text"
            inputProps={{ min: 0 }}
            value={inStock}
            onChange={(e) => setInStock(Number(e.target.value))}
          />
        </Grid>

        {/* --- NEW FIELDS: POPULAR, TRENDING, FEATURED, NEW ARRIVAL --- */}
        <Grid item xs={12}>
          <Box sx={{ p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold', color: '#555' }}>
              Product Visibility Options
            </Typography>
            <Grid container spacing={0}>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={<Checkbox checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} />}
                  label="Popular"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={<Checkbox checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} />}
                  label="Trending"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={<Checkbox checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />}
                  label="Featured"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={<Checkbox checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} />}
                  label="New"
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* --- NEW FIELD: TAGS --- */}
        {/* <Grid item xs={12}>
          <TextField
            fullWidth
            label="Search Tags"
            placeholder="e.g. Cotton, Summer, Party Wear"
            variant="outlined"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            helperText="Separate tags with commas (,)"
          />
        </Grid> */}
      </>
    )}
  </Grid>
</DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        // Is line se position change hogi
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} 
      >
        <SnackbarContent
          message={snackbarMessage}
          style={{
            backgroundColor: snackbarSeverity === "success" ? "green" : "red",
          }}
        />
      </Snackbar>
    </div>
  );
};

export default ProductForm;
