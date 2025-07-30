import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Typography,
  TextField,
  styled,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useFilterStore from "../../../store/filterStore";
import { useParams } from "react-router-dom";
import useProductStore from "../../../store/productStore";

const CustomTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#f8f9fa",
    "& fieldset": {
      borderColor: "#26BDB8",
    },
    "&:hover fieldset": {
      borderColor: "#00B3A4",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#00B3A4",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#666",
    "&.Mui-focused": {
      color: "#00B3A4",
    },
  },
});

const StyledAccordion = styled(Accordion)({
  border: "none",
  boxShadow: "none",
  "&:before": {
    display: "none",
  },
  "&.Mui-expanded": {
    margin: "0",
  },
});

const StyledAccordionSummary = styled(AccordionSummary)({
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  marginBottom: "8px",
  "&:hover": {
    backgroundColor: "rgba(0, 179, 164, 0.05)",
  },
  "& .MuiAccordionSummary-content": {
    margin: "12px 0",
  },
});

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  margin: 0,
  padding: "8px 0",
  "& .MuiCheckbox-root": {
    color: "#26BDB8",
    "&.Mui-checked": {
      color: "#00B3A4",
    },
    "&:hover": {
      backgroundColor: "rgba(0, 179, 164, 0.1)",
    },
  },
  "& .MuiTypography-root": {
    fontSize: "0.95rem",
    color: "#333",
    fontWeight: 400,
  },
  "&:hover": {
    backgroundColor: "rgba(0, 179, 164, 0.05)",
  },
  transition: "all 0.2s ease",
  [theme.breakpoints.down("sm")]: {
    "& .MuiTypography-root": {
      fontSize: "0.9rem",
    },
  },
}));

const SidebarFilter = ({ setFilters }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [article, setArticle] = useState("");

  const { fetchFilter, filters, loading } = useFilterStore();
  const { fetchProducts } = useProductStore();
  const [selectedValues, setSelectedValues] = useState([]);
  const { id } = useParams();
  const category_id = id;

  useEffect(() => {
    fetchFilter(category_id);
  }, [category_id]);

  useEffect(() => {
    if (drawerOpen && filters && filters.data && filters.data.characteristics) {
      const initialCharacteristics = filters.data.characteristics.map(
        (filter) => ({
          characteristic_id: filter.id,
          values: [],
        })
      );
      setSelectedValues(initialCharacteristics);
    }
  }, [drawerOpen, filters]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleChangeCheckbox = (characteristicId, value) => {
    const updatedSelectedValues = [...selectedValues];
    const index = updatedSelectedValues.findIndex(
      (item) => item.characteristic_id === characteristicId
    );

    if (index !== -1) {
      const currentCharacteristic = updatedSelectedValues[index];
      if (currentCharacteristic.values.includes(value)) {
        currentCharacteristic.values = currentCharacteristic.values.filter(
          (v) => v !== value
        );
      } else {
        currentCharacteristic.values = [value]; // Только одно значение
      }
      setSelectedValues(updatedSelectedValues);
    }
  };

  const handleApplyFilters = async () => {
    const filterData = {
      price: {
        min: minPrice ? Number(minPrice) : 0,
        max: maxPrice ? Number(maxPrice) : 0,
      },
      characteristics: selectedValues
        .filter((characteristic) => characteristic.values.length > 0)
        .map((characteristic) => ({
          characteristic_id: characteristic.characteristic_id,
          values: characteristic.values.map((value) => value.toString()),
        })),
      article: article || undefined, // Добавляем артикл, если он задан
    };

    const queryParams = new URLSearchParams();
    if (article) {
      queryParams.append("article", article);
    }

    const jsonData = JSON.stringify(filterData);
    await fetchProducts(category_id, jsonData, queryParams.toString());
    toggleDrawer();
  };

  const handleResetFilters = () => {
    setSelectedValues(
      filters.data.characteristics.map((filter) => ({
        characteristic_id: filter.id,
        values: [],
      }))
    );
    setMinPrice("");
    setMaxPrice("");
    setArticle("");
    fetchProducts(category_id, null);
    toggleDrawer();
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Button
        variant="outlined"
        startIcon={<FilterListIcon />}
        sx={{
          borderRadius: "12px",
          textTransform: "none",
          fontWeight: 500,
          px: { xs: 2.5, sm: 3.5 },
          py: 1,
          color: "#00B3A4",
          borderColor: "#00B3A4",
          backgroundColor: "rgba(0, 179, 164, 0.05)",
          "&:hover": {
            backgroundColor: "rgba(0, 179, 164, 0.1)",
            borderColor: "#00B3A4",
          },
          transition: "all 0.3s ease",
        }}
        onClick={toggleDrawer}
      >
        Фильтры
      </Button>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "85%", sm: "400px", md: "450px" },
            maxWidth: "100%",
            height: "100vh",
            backgroundColor: "#fff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            transition: "transform 0.3s ease-in-out",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ p: 3, borderBottom: "1px solid #f0f0f0" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: "#00B3A4" }}
              >
                Фильтры
              </Typography>
              <IconButton onClick={toggleDrawer}>
                <CloseIcon sx={{ color: "#666" }} />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress sx={{ color: "#00B3A4" }} />
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 500, mb: 2 }}
                  >
                    Цена
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <CustomTextField
                      label="От"
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      sx={{ flex: 1 }}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                    <CustomTextField
                      label="До"
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      sx={{ flex: 1 }}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 500, mb: 2 }}
                  >
                    Поиск по артиклу
                  </Typography>
                  <CustomTextField
                    label="Артикул"
                    value={article}
                    onChange={(e) => setArticle(e.target.value)}
                    sx={{ width: "100%" }}
                  />
                </Box>

                {filters &&
                filters.data &&
                filters.data.characteristics &&
                filters.data.characteristics.length > 0 ? (
                  filters.data.characteristics.map((char) => (
                    <StyledAccordion key={char.id}>
                      <StyledAccordionSummary
                        expandIcon={
                          <ExpandMoreIcon sx={{ color: "#00B3A4" }} />
                        }
                      >
                        <Typography sx={{ fontWeight: 500, color: "#333" }}>
                          {char.name}
                        </Typography>
                      </StyledAccordionSummary>
                      <AccordionDetails sx={{ backgroundColor: "#fff", py: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                            maxHeight: "200px",
                            overflowY: "auto",
                            padding: "8px 0",
                          }}
                        >
                          {char.values.map((value, index) => (
                            <StyledFormControlLabel
                              key={`${char.id}-${value}`}
                              control={
                                <Checkbox
                                  checked={selectedValues.some(
                                    (c) =>
                                      c.characteristic_id === char.id &&
                                      c.values.includes(value)
                                  )}
                                  onChange={() =>
                                    handleChangeCheckbox(char.id, value)
                                  }
                                />
                              }
                              label={
                                typeof value === "boolean"
                                  ? value
                                    ? "Есть"
                                    : "Нету"
                                  : value
                              }
                              sx={{
                                borderBottom:
                                  index < char.values.length - 1
                                    ? "1px solid #f0f0f0"
                                    : "none",
                                py: 0.5,
                              }}
                            />
                          ))}
                        </Box>
                      </AccordionDetails>
                    </StyledAccordion>
                  ))
                ) : (
                  <Typography sx={{ color: "#666", py: 2 }}>
                    Нет доступных фильтров
                  </Typography>
                )}
              </>
            )}
          </Box>

          <Box
            sx={{
              p: 3,
              borderTop: "1px solid #f0f0f0",
              backgroundColor: "#fff",
              boxShadow: "0 -2px 5px rgba(0,0,0,0.05)",
            }}
          >
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                disabled={loading}
                sx={{
                  backgroundColor: "#00B3A4",
                  color: "#fff",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 500,
                  px: 3,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "#26BDB8",
                  },
                  "&:disabled": {
                    backgroundColor: "#ccc",
                  },
                }}
              >
                Применить
              </Button>
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                disabled={loading}
                sx={{
                  borderColor: "#E74C3C",
                  color: "#E74C3C",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 500,
                  px: 3,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "rgba(231, 76, 60, 0.05)",
                    borderColor: "#E74C3C",
                  },
                  "&:disabled": {
                    borderColor: "#ccc",
                    color: "#ccc",
                  },
                }}
              >
                Сбросить
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default SidebarFilter;
