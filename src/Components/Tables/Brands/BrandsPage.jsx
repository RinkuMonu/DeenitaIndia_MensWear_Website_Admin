import { useState, useEffect } from "react";
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Grid, Pagination, IconButton,
  Divider, Box
} from "@mui/material";
import { apiDelete, apiGet } from "../../../api/apiMethods";
import BrandForm from "./BrandForm";
import { DeleteForeverOutlined } from "@mui/icons-material";
import DeleteDialog from "../Website/DeleteDialog";
import { useUser } from "../../../Context/UserContext";

const BrandsPage = () => {
  const [data, setData] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterWebsite, setfilterWebsite] = useState("");
  const [pageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  
  const { user } = useUser();
  const API_ENDPOINT = `api/brands`; 

  const fetchData = async () => {
    try {
      const response = await apiGet(API_ENDPOINT, {
        referenceWebsite: filterWebsite,
        search: searchInput,
        page: currentPage,
        limit: pageSize,
      });
      
      // Aapke response structure ke hisaab se: response.data.brands
      setData(response.data.brands || []);
      // Pagination handling
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      setData([]);
      console.error("Fetch Error:", error.message);
    }
  };

  // User role check and website filter
  useEffect(() => {
    if (user) {
      if (user.role === "super-admin") {
        // Yahan aap websites fetch karne ka logic rakh sakte hain
        // filhaal agar referenceWebsite nahi hai toh empty string
      } else {
        setfilterWebsite(user.referenceWebsite);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [filterWebsite, currentPage, searchInput]);

  const openDialog = (id) => {
    setSelectedItemId(id);
    setDialogOpen(true);
  };

  const deleteHandler = async (id) => {
    try {
      await apiDelete(`api/brands/${id}`);
      fetchData();
      setDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container justifyContent="space-between" alignItems="center">
        <Typography variant="h5" sx={{ fontWeight: "600", color: "#2a4172" }}>
          Brands Listing
        </Typography>
        <BrandForm dataHandler={fetchData} />
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Search by Name"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCurrentPage(1);
            }}
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ backgroundColor: "#fbe5ec" }}>
            <TableRow>
              <TableCell><strong>#</strong></TableCell>
              <TableCell><strong>Logo</strong></TableCell>
              <TableCell><strong>Brand Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={item._id}>
                  <TableCell>
                    {index + 1 + (Number(currentPage) - 1) * pageSize}
                  </TableCell>
                  <TableCell>
                    <img
                      src={item.logo ? `https://api.deenitaindia.com${item.logo}` : "/placeholder-brand.png"}
                      alt={item.name}
                      style={{ 
                        width: "40px", 
                        height: "40px", 
                        borderRadius: "50%", 
                        objectFit: "cover",
                        border: "1px solid #eee"
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: "500" }}>
                    {item.name}
                  </TableCell>
                  <TableCell>
                    {item.description || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Box 
                      sx={{ 
                        color: item.isActive ? "success.main" : "error.main",
                        fontWeight: "bold",
                        fontSize: "0.85rem"
                      }}
                    >
                      {item.isActive ? "● Active" : "● Inactive"}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                      <BrandForm initialData={item} dataHandler={fetchData} />
                      <IconButton color="error" size="small" onClick={() => openDialog(item._id)}>
                        <DeleteForeverOutlined fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  No brands found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Pagination
          count={totalPages}
          page={Number(currentPage)}
          onChange={(e, v) => setCurrentPage(v)}
          color="primary"
          shape="rounded"
        />
      </Box>

      <DeleteDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        deleteHandler={deleteHandler}
        itemId={selectedItemId}
      />
    </Box>
  );
};

export default BrandsPage;