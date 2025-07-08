import { Box, Tabs, Tab, Typography, List, ListItem } from "@mui/material";
import { memo } from "react";

const TabPanel = memo(({ children, value, index, ...other }) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`tabpanel-${index}`}
    aria-labelledby={`tab-${index}`}
    sx={{ mt: 2 }}
    {...other}
  >
    {value === index && <Box>{children}</Box>}
  </Box>
));

export default function ProductTabs({ product, tabValue, setTabValue }) {
  const renderFeatureValue = (value) => {
    if (value === "true") return "Есть";
    if (value === "false") return "Нет";
    if (!value) return "Нет данных";
    return value;
  };

  return (
    <>
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{
          borderBottom: "1px solid #E0E0E0",
          "& .MuiTabs-indicator": {
            backgroundColor: "#00B3A4",
          },
        }}
        aria-label="Вкладки описания и характеристик"
      >
        <Tab
          label="Описание"
          sx={{
            color: "#00B3A4",
            "&.Mui-selected": {
              color: "#00B3A4",
              fontWeight: "bold",
            },
            "&:hover": {
              color: "#009B8A",
            },
            textTransform: "none",
            fontSize: "1rem",
            padding: "12px 24px",
          }}
          id="tab-0"
          aria-controls="tabpanel-0"
        />
        <Tab
          label="Характеристики"
          sx={{
            color: "#00B3A4",
            "&.Mui-selected": {
              color: "#00B3A4",
              fontWeight: "bold",
            },
            "&:hover": {
              color: "#009B8A",
            },
            textTransform: "none",
            fontSize: "1rem",
            padding: "12px 24px",
          }}
          id="tab-1"
          aria-controls="tabpanel-1"
        />
      </Tabs>
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mt: 2 }}>
          {product?.description ? (
            <div
              dangerouslySetInnerHTML={{
                __html: product.description,
              }}
              style={{
                wordBreak: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "normal",
                lineHeight: 1.5,
                fontSize: { xs: "0.9rem", md: "1rem" },
                color: "#424242",
              }}
            />
          ) : (
            <Typography variant="body1" sx={{ color: "#424242" }}>
              Описание отсутствует
            </Typography>
          )}
        </Box>
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <Box
          sx={{
            backgroundColor: "#F5F5F5",
            borderRadius: 2,
            p: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <List sx={{ p: 0 }}>
            {product?.characteristic
              ?.filter(
                (c) =>
                  c.name.toLowerCase() !== "размер" &&
                  c.name.toLowerCase() !== "объем/размер" &&
                  c.name.toLowerCase() !== "цвет" &&
                  c.name.toLowerCase() !== "рост"
              )
              .map((feature, index) => (
                <ListItem
                  key={index}
                  sx={{
                    py: 1,
                    px: 2,
                    borderBottom:
                      index <
                      (product?.characteristic?.filter(
                        (c) =>
                          c.name.toLowerCase() !== "размер" &&
                          c.name.toLowerCase() !== "объем/размер" &&
                          c.name.toLowerCase() !== "цвет" &&
                          c.name.toLowerCase() !== "рост"
                      )?.length || 0) -
                        1
                        ? "1px solid #E0E0E0"
                        : "none",
                    "&:hover": {
                      backgroundColor: "#ECEFF1",
                      borderRadius: 1,
                    },
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: "medium",
                        color: "#212121",
                        fontSize: "0.95rem",
                      }}
                    >
                      {feature.name}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#424242",
                        fontSize: "0.95rem",
                        fontWeight: "normal",
                      }}
                    >
                      {renderFeatureValue(feature.value)}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
          </List>
        </Box>
      </TabPanel>
    </>
  );
}
