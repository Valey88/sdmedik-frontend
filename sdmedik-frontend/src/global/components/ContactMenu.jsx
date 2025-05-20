import { Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import React, { useState } from "react";

const ContactMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gridGap: 20 }}>
      <IconButton
        id="contact-button"
        aria-controls={open ? "contact-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <img src="/Phone.png" alt="phone" />
      </IconButton>
      <Menu
        id="contact-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "contact-button" }}
      >
        <MenuItem onClick={handleClose}>+7 (903) 086 3091</MenuItem>
        <MenuItem onClick={handleClose}>+7 (353) 293 5241</MenuItem>
      </Menu>
      {/* <Typography color="black">olimp1-info@yandex.ru</Typography> */}
    </Box>
  );
};

export default ContactMenu;
