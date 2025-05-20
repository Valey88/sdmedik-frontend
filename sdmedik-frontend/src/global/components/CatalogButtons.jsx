import { Box, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const CatalogButtons = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: "max-content",
        display: { xs: "none", sm: "none", md: "flex", lg: "flex" },
        alignItems: "center",
        gridGap: 10,
        p: "0px 10px",
      }}
    >
      {/* <Link
        style={{
          background: `linear-gradient(95.61deg, #A5DED1 4.71%, #00B3A4 97.25%)`,
          padding: "10px 20px",
          fontSize: "18px",
          fontWeight: "500",
          borderRadius: "5px",
          color: "#fff",
          marginLeft: "0px",
          marginRight: "0px",
        }}
        to="/catalog"
      > */}
      {/* <Button
          variant="contained"
          onClick={(e) => {
            e.preventDefault();
            navigate("/catalog");
          }}
          sx={{
            background: `linear-gradient(95.61deg, #A5DED1 4.71%, #00B3A4 97.25%)`,
            fontSize: "16px",
          }}
        >
          Каталог
        </Button> */}
      {/* Каталог
      </Link> */}
      <Link
        style={{
          background: `linear-gradient(95.61deg, #A5DED1 4.71%, #00B3A4 97.25%)`,
          padding: "10px 20px",
          fontSize: "18px",
          fontWeight: "300",
          borderRadius: "5px",
          marginLeft: "0px",
          marginRight: "0px",
          color: "#fff",
          width: "150px",
          display: "flex",
          justifyContent: "center",
        }}
        to="/catalog/certificate"
      >
        {/* <Button
          variant="contained"
          // onClick={(e) => {
          //   e.preventDefault();
          //   navigate("/catalog/certificate");
          // }}
          sx={{
            background: `linear-gradient(95.61deg, #A5DED1 4.71%, #00B3A4 97.25%)`,
            fontSize: "16px",
          }}
        > */}
        Каталог
        {/* </Button> */}
      </Link>
    </Box>
  );
};

export default CatalogButtons;
