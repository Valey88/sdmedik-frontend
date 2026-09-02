import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  Tabs,
  Tab,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Rating,
  Chip,
  Avatar,
  Stack,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  CheckCircle,
  Cancel,
  Delete,
  Add,
  RateReview,
  WhatsApp,
  Telegram,
  Language,
  Edit,
  Visibility,
  HourglassEmpty,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import useReviewStore from "../../../../store/reviewStore";
import ShortLink from "../../../reviews/components/ShortLink";
import ReviewMediaViewer from "../../../reviews/components/ReviewMediaViewer";
import AdminCreateReviewModal from "./AdminCreateReviewModal";
import AdminEditReviewModal from "./AdminEditReviewModal";
import {
  getSourceConfig,
  MaxIcon,
  VkIcon,
  TelegramIcon,
  WhatsAppIcon,
  YandexIcon,
  SdmedikIcon,
  OtherIcon,
} from "../../../reviews/components/SourceIcons";
import { getReviewImageUrl } from "../../../../utils/reviewImage";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  backgroundColor: theme.palette.background.paper,
  overflow: "hidden",
}));

const StyledHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  flexWrap: "wrap",
  gap: theme.spacing(2),
}));

const SearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 50,
    backgroundColor: theme.palette.background.paper,
  },
  width: "100%",
  maxWidth: 320,
}));

function getSourceChip(source) {
  const cfg = getSourceConfig(source);
  return (
    <Chip
      icon={cfg.icon}
      label={cfg.shortLabel || cfg.label}
      size="small"
      sx={{
        backgroundColor: cfg.bgColor,
        color: cfg.color,
        fontWeight: 600,
        border: `1px solid ${cfg.borderColor}`,
        "& .MuiChip-icon": { ml: "4px" },
      }}
    />
  );
}

function getStatusChip(status) {
  switch (status) {
    case "approved":
      return (
        <Chip
          icon={<CheckCircle sx={{ fontSize: "14px !important" }} />}
          label="Одобрен"
          size="small"
          color="success"
          variant="filled"
          sx={{ fontWeight: 600 }}
        />
      );
    case "rejected":
      return (
        <Chip
          icon={<Cancel sx={{ fontSize: "14px !important" }} />}
          label="Отклонен"
          size="small"
          color="error"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      );
    case "pending":
    default:
      return (
        <Chip
          icon={<HourglassEmpty sx={{ fontSize: "14px !important" }} />}
          label="На модерации"
          size="small"
          color="warning"
          variant="filled"
          sx={{ fontWeight: 600 }}
        />
      );
  }
}

export default function AdminReviewsTable() {
  const {
    adminReviews,
    adminTotal,
    adminLoading,
    fetchAdminReviews,
    adminUpdateStatus,
    adminDeleteReview,
  } = useReviewStore();

  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedReviewForEdit, setSelectedReviewForEdit] = useState(null);

  // Lightbox state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const limit = 15;

  useEffect(() => {
    fetchAdminReviews({
      page,
      limit,
      status: activeTab,
      source: sourceFilter,
      search: searchQuery,
    });
  }, [activeTab, sourceFilter, page, searchQuery, fetchAdminReviews]);

  const handleTabChange = (event, newTab) => {
    setActiveTab(newTab);
    setPage(1);
  };

  const handleStatusChange = async (id, status) => {
    await adminUpdateStatus(id, status);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Вы уверены, что хотите безвозвратно удалить этот отзыв?")) {
      await adminDeleteReview(id);
    }
  };

  const handleEdit = (rev) => {
    setSelectedReviewForEdit(rev);
    setEditModalOpen(true);
  };

  const handleOpenPhoto = (images, index = 0) => {
    setViewerImages(images);
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const totalPages = Math.ceil(adminTotal / limit) || 1;

  // Pending count indicator
  const pendingCount = useMemo(() => {
    if (activeTab === "pending") return adminTotal;
    return 0;
  }, [activeTab, adminTotal]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          mb: 3,
          overflow: "hidden",
          border: "1px solid #e0e0e0",
        }}
      >
        {/* Header Bar */}
        <StyledHeader>
          <Box>
            <Typography variant="h5" fontWeight="700" color="text.primary">
              Модерация и управление отзывами
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Всего в разделе: {adminTotal}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <SearchField
              placeholder="Поиск по автору, тексту..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery("")}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="source-filter-label">Источник</InputLabel>
              <Select
                labelId="source-filter-label"
                value={sourceFilter}
                label="Источник"
                onChange={(e) => {
                  setSourceFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="all">Все источники</MenuItem>
                <MenuItem value="max">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <MaxIcon sx={{ fontSize: 18 }} /> МАКС (MAX)
                  </Box>
                </MenuItem>
                <MenuItem value="vk">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <VkIcon sx={{ fontSize: 18 }} /> ВКонтакте
                  </Box>
                </MenuItem>
                <MenuItem value="telegram">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TelegramIcon sx={{ fontSize: 18 }} /> Telegram
                  </Box>
                </MenuItem>
                <MenuItem value="whatsapp">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <WhatsAppIcon sx={{ fontSize: 18 }} /> WhatsApp
                  </Box>
                </MenuItem>

                <MenuItem value="yandex">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <YandexIcon sx={{ fontSize: 18 }} /> Яндекс
                  </Box>
                </MenuItem>
                <MenuItem value="website">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SdmedikIcon sx={{ fontSize: 18 }} /> Сайт sdmedik
                  </Box>
                </MenuItem>
                <MenuItem value="other">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <OtherIcon sx={{ fontSize: 18 }} /> Другой источник
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateModalOpen(true)}
              sx={{
                bgcolor: "#1976D2",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "8px",
                "&:hover": { bgcolor: "#1565C0" },
              }}
            >
              Добавить отзыв от клиента
            </Button>
          </Box>
        </StyledHeader>

        {/* Tabs for Moderation */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3, bgcolor: "#fff" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              value="pending"
              label="⏳ На модерации"
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.95rem" }}
            />
            <Tab
              value="approved"
              label="✅ Одобренные"
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.95rem" }}
            />
            <Tab
              value="rejected"
              label="❌ Отклоненные"
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.95rem" }}
            />
            <Tab
              value="all"
              label="📋 Все отзывы"
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.95rem" }}
            />
          </Tabs>
        </Box>

        {/* Table Content */}
        {adminLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <StyledTableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width={180}>Автор / Контакт</TableCell>
                  <TableCell width={120}>Источник</TableCell>
                  <TableCell width={120}>Оценка</TableCell>
                  <TableCell>Текст отзыва</TableCell>
                  <TableCell width={160}>Ссылки</TableCell>
                  <TableCell width={100}>Фото</TableCell>
                  <TableCell width={120}>Статус</TableCell>
                  <TableCell width={160} align="right">
                    Действия
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adminReviews.length > 0 ? (
                  adminReviews.map((rev) => {
                    let parsedLinks = [];
                    if (rev.links) {
                      try {
                        parsedLinks =
                          typeof rev.links === "string"
                            ? JSON.parse(rev.links)
                            : rev.links;
                        if (!Array.isArray(parsedLinks)) parsedLinks = [];
                      } catch (e) {
                        if (typeof rev.links === "string" && rev.links.trim()) {
                          parsedLinks = [rev.links.trim()];
                        }
                      }
                    }

                    const images = rev.images || [];

                    return (
                      <TableRow key={rev.id} hover>
                        {/* Author */}
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {rev.author_name}
                          </Typography>
                          {rev.author_contact && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {rev.author_contact}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.disabled" display="block">
                            {new Date(rev.review_date || rev.created_at).toLocaleDateString("ru-RU")}
                          </Typography>
                        </TableCell>

                        {/* Source */}
                        <TableCell>{getSourceChip(rev.source)}</TableCell>

                        {/* Rating */}
                        <TableCell>
                          <Rating
                            value={rev.rating || 5}
                            readOnly
                            size="small"
                            sx={{ color: "#FFB800" }}
                          />
                        </TableCell>

                        {/* Text */}
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 400,
                              whiteSpace: "pre-line",
                              lineHeight: 1.5,
                            }}
                          >
                            {rev.text}
                          </Typography>
                        </TableCell>

                        {/* Links */}
                        <TableCell>
                          {parsedLinks.length > 0 ? (
                            <Stack spacing={0.5}>
                              {parsedLinks.map((link, idx) => (
                                <ShortLink key={idx} url={link} />
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant="caption" color="text.disabled">
                              —
                            </Typography>
                          )}
                        </TableCell>

                        {/* Photos */}
                        <TableCell>
                          {images.length > 0 ? (
                            <Stack direction="row" spacing={0.5}>
                              {images.slice(0, 2).map((img, idx) => (
                                <Box
                                  key={idx}
                                  component="img"
                                  src={getReviewImageUrl(img)}
                                  alt="Фото"
                                  onClick={() => handleOpenPhoto(images, idx)}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2238%22%20height%3D%2238%22%20viewBox%3D%220%200%2038%2038%22%3E%3Crect%20fill%3D%22%23F1F5F9%22%20width%3D%2238%22%20height%3D%2238%22%2F%3E%3Ctext%20fill%3D%22%2394A3B8%22%20font-family%3D%22sans-serif%22%20font-size%3D%229%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3E%D0%A4%D0%BE%D1%82%D0%BE%3C%2Ftext%3E%3C%2Fsvg%3E";
                                  }}
                                  sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 1,
                                    objectFit: "cover",
                                    cursor: "pointer",
                                    border: "1px solid #E2E8F0",
                                    "&:hover": { transform: "scale(1.1)" },
                                  }}
                                />
                              ))}
                              {images.length > 2 && (
                                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>
                                  +{images.length - 2}
                                </Typography>
                              )}
                            </Stack>
                          ) : (
                            <Typography variant="caption" color="text.disabled">
                              —
                            </Typography>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell>{getStatusChip(rev.status)}</TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="Редактировать отзыв (текст, фото, автора)">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEdit(rev)}
                                sx={{
                                  bgcolor: alpha("#1976d2", 0.1),
                                  "&:hover": { bgcolor: alpha("#1976d2", 0.2) },
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {rev.status !== "approved" && (
                              <Tooltip title="Одобрить и опубликовать">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleStatusChange(rev.id, "approved")}
                                  sx={{
                                    bgcolor: alpha("#2e7d32", 0.1),
                                    "&:hover": { bgcolor: alpha("#2e7d32", 0.2) },
                                  }}
                                >
                                  <CheckCircle fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            {rev.status !== "rejected" && (
                              <Tooltip title="Отклонить">
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() => handleStatusChange(rev.id, "rejected")}
                                  sx={{
                                    bgcolor: alpha("#ed6c02", 0.1),
                                    "&:hover": { bgcolor: alpha("#ed6c02", 0.2) },
                                  }}
                                >
                                  <Cancel fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            <Tooltip title="Удалить">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(rev.id)}
                                sx={{
                                  bgcolor: alpha("#d32f2f", 0.1),
                                  "&:hover": { bgcolor: alpha("#d32f2f", 0.2) },
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        {activeTab === "pending"
                          ? "Нет отзывов, ожидающих модерации 🎉"
                          : "Отзывы не найдены"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, v) => setPage(v)}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* Admin Create Review Modal */}
      <AdminCreateReviewModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          fetchAdminReviews({ page: 1, limit, status: activeTab });
        }}
      />

      {/* Admin Edit Review Modal */}
      <AdminEditReviewModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedReviewForEdit(null);
        }}
        review={selectedReviewForEdit}
        onSuccess={() => {
          fetchAdminReviews({
            page,
            limit,
            status: activeTab,
            source: sourceFilter,
            search: searchQuery,
          });
        }}
      />

      {/* Lightbox for Admin Photos */}
      <ReviewMediaViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        images={viewerImages}
        currentIndex={viewerIndex}
        onIndexChange={setViewerIndex}
      />
    </Container>
  );
}
