import { Box, Typography, Select, MenuItem } from "@mui/material";
import Regions from "../../constants/regionsData/regions";

export default function RegionSelector({
  newRegion,
  setNewRegion,
  fetchProductById,
  productId,
}) {
  const handleChangeRegion = (event) => {
    const selectedValue = event.target.value;
    if (selectedValue === "") {
      setNewRegion(null);
      fetchProductById(productId);
      return;
    }
    const selectedRegion = Regions.find(
      (region) => region.value === selectedValue
    );
    if (selectedRegion) {
      setNewRegion(selectedRegion);
      fetchProductById(productId, selectedRegion.value);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", mb: 1, color: "#212121" }}
      >
        Выберите регион:
      </Typography>
      <Select
        value={newRegion?.value || ""}
        onChange={handleChangeRegion}
        displayEmpty
        sx={{
          minWidth: 200,
          borderRadius: 1,
          border: "1px solid #E0E0E0",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E0E0E0",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00B3A4",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00B3A4",
            borderWidth: 2,
          },
          backgroundColor: "#FFFFFF",
          "&:hover": { backgroundColor: "#F5F5F5" },
        }}
        aria-label="Выбор региона"
      >
        <MenuItem value="">
          <em>Не выбран</em>
        </MenuItem>
        {Regions.map((region) => (
          <MenuItem key={region.value} value={region.value}>
            {region.name}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
