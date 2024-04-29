import React, {useState, useEffect, useMemo} from "react";
import PropTypes from "prop-types";
import {DataGrid,GridToolbarContainer, GridToolbarExport, GridToolbarQuickFilter, GridToolbarFilterButton, GridToolbarDensitySelector} from '@mui/x-data-grid';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Box, Button, Dialog,DialogActions, DialogTitle, Typography} from "@mui/material";
import EmptyRowDisplay from "./EmptyRowDisplay";
import * as GeoLib from 'geolib';

const CustomToolbar = () => {
  return (
    <Box justifyContent="center" sx={{display: "flex",  width: '100%' }}>
      <GridToolbarContainer>
        <GridToolbarFilterButton/>
        <GridToolbarDensitySelector/>
        <GridToolbarExport/>
      </GridToolbarContainer>
    </Box>
  );
}

const TabularViewerGeolocator = ({title, grabData, updateData, tableHeaders, uniqueIdentifier}) => {
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [tableData, setTableData] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    const [distanceColEnabled, setDistanceColEnabled] = useState(false);
    
    // TODO: Remove reserve button for non-active reservations or make a query that removes them 
    const columns = tableHeaders.concat(
        {
            field: 'Distance Away',
            headerName: 'Distance Away',
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            minWidth: 150, 
            renderCell: (params) => (
                <p color={"black"}> {getDistanceString(params)} </p>
            )
        },
    )

    const getDistanceString = (params) => {
        try {
            return String(calculateDistance(params["row"]["latitude"], params["row"]["longitude"])) + " miles";
        } catch (e) {
            return "Error loading distance"
        }
    }

    const calculateDistance = (targetLatitude, targetLongitude) => {
        const distance = GeoLib.getDistance(
          { latitude: latitude, longitude: longitude },
          { latitude: targetLatitude, longitude: targetLongitude},
        ); 
        const miles_multiplier = 0.621371
        const miles = (distance / 1000) *  miles_multiplier;
        return miles.toFixed(2);
    };

    // Recommended way to solve by GPT 3.5 although edited for custom use
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
            },
            (error) => { console.error('Error getting current location:', error); });
            setDistanceColEnabled(true);
        } else {
            setDistanceColEnabled(false);
            console.error('Geolocation is not supported by this browser.'); }
    };

    const processRowUpdate = () => {}

    useEffect(() => {
        getCurrentLocation();
        grabData().then((response) => {
            setTableData(response.data[title]);
            console.log(response.data);
        })
        .catch((error) => {
        });
    }, []);
    
    return (
        <>
            {/* <Dialog open={true}>
            <Box justifyContent="center" sx={{display: "flex",  width: '100%' }}>
                <iframe src="https://www.google.com/maps/embed/v1/place?key=AIzaSyDLrIBIQYj8WU8W5nT8u3fZlidMWz_jdRc
            &q=Space+Needle,Seattle+WA" loading="lazy"
            allowfullscreen>
                </iframe>
                <DialogActions>
                    <Button>
                        Hi
                    </Button>
                </DialogActions>
            </Box>
            </Dialog> */}
            <Box justifyContent="center" sx={{display: "flex",  width: '100%' }}>
                <DataGrid
                    autoHeight
                    style={{position: "absolute"}}
                    getRowId={row=>row[uniqueIdentifier]}
                    rows={tableData}
                    editMode="row"
                    columns={columns}
                    pageSizeOptions={[5, 10]}
                    slots={{ noRowsOverlay: EmptyRowDisplay,  toolbar: CustomToolbar }}
                    rowModesModel={rowModesModel}
                    processRowUpdate={processRowUpdate}
                    pagination
                />
            </Box>
        </>
    );
}

TabularViewerGeolocator.propTypes = {
    title: PropTypes.string,
    grabData: PropTypes.func,
    updateData: PropTypes.func,
    tableHeaders: PropTypes.array,
    uniqueIdentifier: PropTypes.string
};

export default TabularViewerGeolocator 