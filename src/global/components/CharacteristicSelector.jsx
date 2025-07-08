import { Box, Typography } from "@mui/material";

export default function CharacteristicSelector({
  label,
  characteristicName,
  characteristics,
  selectedValue,
  setSelectedValue,
}) {
  const values = characteristics
    ?.filter((c) => c.name.toLowerCase() === characteristicName.toLowerCase())
    .flatMap((c) => c.value);

  if (!values || values.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", mb: 1, color: "#212121" }}
      >
        {label}:
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
        }}
        role="radiogroup"
        aria-label={label}
      >
        {values.map((value, index) => (
          <Box
            key={index}
            onClick={() => setSelectedValue(value)}
            sx={{
              width: "max-content",
              height: 40,
              border:
                selectedValue === value
                  ? "2px solid #00B3A4"
                  : "1px solid #E0E0E0",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backgroundColor:
                selectedValue === value ? "#00B3A4" : "transparent",
              color: selectedValue === value ? "#FFFFFF" : "text.primary",
              "&:hover": {
                borderColor: "#009B8A",
                backgroundColor:
                  selectedValue === value ? "#009B8A" : "#F5F5F5",
              },
              pl: 1,
              pr: 1,
              transition: "all 0.2s ease",
            }}
            role="radio"
            aria-checked={selectedValue === value}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setSelectedValue(value);
              }
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: "medium" }}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
