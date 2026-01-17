// import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid } from '@mui/material';

const ViewDetail = ({ open, onClose, websiteData }) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontSize: 22, fontWeight: 'medium' }}>Website Details</DialogTitle>
            <DialogContent>
                {websiteData ? (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="body1" fontWeight="bold" color="textSecondary">
                                Website Name
                            </Typography>
                            <Typography variant="body1" sx={{ marginTop: 0.5 }}>
                                {websiteData.websiteName}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body1" fontWeight="bold" color="textSecondary">
                                Website ID
                            </Typography>
                            <Typography variant="body1" sx={{ marginTop: 0.5 }}>
                                {websiteData._id}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body1" fontWeight="bold" color="textSecondary">
                                Description
                            </Typography>
                            <Typography variant="body1" sx={{ marginTop: 0.5 }}>
                                {websiteData.websiteDescription || 'No description provided'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body1" fontWeight="bold" color="textSecondary">
                                URL
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{ marginTop: 0.5 }}
                                color="primary"
                                component="a"
                                href={websiteData.websiteURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                underline="hover"
                            >
                                {websiteData.websiteURL}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body1" fontWeight="bold" color="textSecondary">
                                Status
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{ marginTop: 0.5 }}
                                color={websiteData.activeStatus ? 'green' : 'red'}
                            >
                                {websiteData.activeStatus ? 'Active' : 'Inactive'}
                            </Typography>
                        </Grid>
                    </Grid>
                ) : (
                    <Typography variant="body1" color="textSecondary">
                        No data available
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary" variant="contained">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};
ViewDetail.propTypes = {
    open: PropTypes.bool.isRequired,        // Dialog khula hai ya nahi (Boolean)
    onClose: PropTypes.func.isRequired,     // Dialog band karne ka function
    websiteData: PropTypes.shape({          // Object ka structure define kiya
        _id: PropTypes.string,
        websiteName: PropTypes.string,
        websiteDescription: PropTypes.string,
        websiteURL: PropTypes.string,
        activeStatus: PropTypes.bool,
    }),
};
export default ViewDetail;
