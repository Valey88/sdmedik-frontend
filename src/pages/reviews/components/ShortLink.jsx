import React from "react";
import { Chip, Tooltip, Link } from "@mui/material";
import { Link as LinkIcon, OpenInNew } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledLinkChip = styled(Chip)(({ theme }) => ({
  backgroundColor: "rgba(38, 189, 184, 0.08)",
  color: "#18948f",
  fontWeight: 500,
  fontSize: "0.82rem",
  borderRadius: "8px",
  border: "1px solid rgba(38, 189, 184, 0.25)",
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  maxWidth: "100%",
  "&:hover": {
    backgroundColor: "rgba(38, 189, 184, 0.16)",
    borderColor: "#26BDB8",
    transform: "translateY(-1px)",
    boxShadow: "0 2px 6px rgba(38, 189, 184, 0.15)",
  },
  "& .MuiChip-icon": {
    color: "#26BDB8",
    fontSize: "1rem",
  },
  "& .MuiChip-label": {
    paddingLeft: "6px",
    paddingRight: "8px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
}));

/**
 * Умная функция сокращения URL:
 * - Убирает протоколы http://, https://, www.
 * - Если длина > maxLength, форматирует как: domain.com/.../path
 */
export function formatShortUrl(url, maxLength = 35) {
  if (!url) return "";
  try {
    let clean = url.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
    if (clean.endsWith("/")) {
      clean = clean.slice(0, -1);
    }
    if (clean.length <= maxLength) {
      return clean;
    }

    const parts = clean.split("/");
    const domain = parts[0];

    if (parts.length > 2) {
      const lastPart = parts[parts.length - 1];
      const remainingLen = maxLength - domain.length - 5;
      const truncatedLast =
        lastPart.length > remainingLen
          ? lastPart.slice(0, Math.max(remainingLen, 6)) + "…"
          : lastPart;
      return `${domain}/…/${truncatedLast}`;
    }

    return clean.slice(0, maxLength - 1) + "…";
  } catch (e) {
    return url.length > maxLength ? url.slice(0, maxLength - 1) + "…" : url;
  }
}

export default function ShortLink({ url }) {
  if (!url) return null;

  // Убедимся, что href имеет протокол
  const href = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
  const shortText = formatShortUrl(url, 35);

  return (
    <Tooltip title={`Перейти: ${url}`} arrow placement="top">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ textDecoration: "none", display: "inline-block", maxWidth: "100%" }}
      >
        <StyledLinkChip
          icon={<LinkIcon />}
          label={
            <>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {shortText}
              </span>
              <OpenInNew sx={{ fontSize: "0.8rem !important", opacity: 0.7 }} />
            </>
          }
          size="small"
        />
      </Link>
    </Tooltip>
  );
}
