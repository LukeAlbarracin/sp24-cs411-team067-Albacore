import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, TextField } from "@mui/material";
import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { httpClient } from "../../infra";

const DialogCredentialForm = ({dialogOpen, setDialogOpen}) => {
    // Utilized: https://mui.com/material-ui/react-text-field/ for password
    // Also, utilized:  https://mui.com/material-ui/react-dialog/
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [netID, setNetID] = useState("");
    const [majors, setMajors] = useState([])
    const [role, setRole] = useState("")
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const getMajors = () => {
      const jwtToken = localStorage.getItem("JWTToken");
      return httpClient
        .get("/majors", {headers: {Authorization: "Bearer " + jwtToken}})
        .then((response) => {
          console.log("majors", response.data["Majors"])
          setMajors(response.data["Majors"])
        }).catch((error)=> {})
    }

    const handleSelectRole = (e) => {
        setRole(e.target.value)
    }

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleClose = (event) => {
        console.log("handle close: ", event);
        setDialogOpen(false)
    };

    useEffect(()=> {
      getMajors()
    }, [])

    return (
        <Dialog
        open={dialogOpen}
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();
            console.log(event);
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const email = formJson.email;
            console.log(formData);
            setDialogOpen(false);
          },
        }}
      >
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Each user must be assigned a netid, password, and role.
          </DialogContentText>
          
          <FormControl required sx={{ m: 1, width: '25ch' }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">NetID</InputLabel>
            <OutlinedInput
                onChange={(e)=>{setNetID(e.target.value)}}
                id="outlined-adornment-password"
                type={'text'}
                label="NetID"
            />
          </FormControl>
          <Divider/>
          <FormControl required sx={{ m: 1, width: '25ch' }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
            <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                onChange={(e)=>setPassword(e.target.value)}
                endAdornment={
                <InputAdornment position="end">
                    <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                </InputAdornment>
                }
                label="Password"
            />
          </FormControl>
          <Divider/>
          <FormControl required sx={{ m: 1, width: '25ch' }} >
            <InputLabel id="demo-simple-select-label">Role</InputLabel>
                <Select label="isAdmin" labelId="demo-simple-select-label" 
                    id="demo-simple-select" value={role} onChange={handleSelectRole}>
                    <MenuItem value={"Admin"}>Admin</MenuItem>
                    <MenuItem value={"Student"}>Student</MenuItem>
                </Select>
          </FormControl>
          <Divider/>
          <FormControl required sx={{ m: 1, width: '25ch' }}>
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={majors}
            renderInput={(params) => <TextField {...params} label="Movie" />}
          />
        </FormControl>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={(e)=>handleClose(e)}>Cancel</Button>
          <Button type="submit" >Create User</Button>
        </DialogActions>
      </Dialog>
    )
}

DialogCredentialForm.propTypes = {
    dialogOpen: PropTypes.bool,
    setDialogOpen: PropTypes.func
}

export default DialogCredentialForm;