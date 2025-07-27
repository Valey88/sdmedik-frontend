// import React, { useState, useMemo, useEffect } from "react";
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Container,
//   Grid,
//   Card,
//   CardMedia,
//   CardContent,
//   Button,
//   TextField,
//   Select,
//   MenuItem,
//   Box,
//   Collapse,
//   IconButton,
//   Alert,
//   CircularProgress,
// } from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import ExpandLessIcon from "@mui/icons-material/ExpandLess";
// import EditIcon from "@mui/icons-material/Edit";
// import SaveIcon from "@mui/icons-material/Save";
// import CancelIcon from "@mui/icons-material/Cancel";
// import { Helmet } from "react-helmet";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
// import sanitizeHtml from "sanitize-html";
// import { Link } from "react-router-dom";
// import useUserStore from "../../store/userStore";

// // Mock data
// const mockPosts = [
//   {
//     id: "1",
//     title: "Как оформить электронный сертификат",
//     content:
//       "<p>Инструкция по оформлению электронного сертификата для получения государственной поддержки...</p><img src='/sample.jpg' alt='Инструкция' /><video src='/sample.mp4' controls></video>",
//     previewImage: "/sample.jpg",
//     date: "2025-07-20",
//     category: "Инструкции",
//     borderColor: "#00B3A4",
//   },
//   {
//     id: "2",
//     title: "Видео: Использование ТСР",
//     content:
//       "<p>Видео-инструкция по использованию технических средств реабилитации...</p><video src='/video.mp4' controls></video>",
//     previewImage: "/video-preview.jpg",
//     date: "2025-07-15",
//     category: "Видео",
//     borderColor: "#FF5733",
//   },
// ];

// // Sanitize HTML content
// const sanitizeContent = (html) => {
//   return sanitizeHtml(html, {
//     allowedTags: [
//       "p",
//       "strong",
//       "em",
//       "ul",
//       "ol",
//       "li",
//       "img",
//       "video",
//       "br",
//       "span",
//       "a",
//     ],
//     allowedAttributes: {
//       img: ["src", "alt"],
//       video: ["src", "controls"],
//       a: ["href", "target"],
//       span: ["style"],
//     },
//   });
// };

// // Editable field component for HTML content
// const EditableHtmlField = ({ value, onChange, isEditing, isAdmin }) => {
//   const modules = {
//     toolbar: [
//       [{ header: [1, 2, 3, false] }],
//       ["bold", "italic", "underline"],
//       [{ list: "ordered" }, { list: "bullet" }],
//       [{ indent: "-1" }, { indent: "+1" }],
//       ["image", "video"],
//       ["emoji"],
//       [{ color: [] }, { background: [] }],
//       ["clean"],
//     ],
//   };

//   return isEditing && isAdmin ? (
//     <ReactQuill
//       value={value}
//       onChange={onChange}
//       modules={modules}
//       theme="snow"
//       style={{ marginBottom: "16px" }}
//     />
//   ) : (
//     <Typography dangerouslySetInnerHTML={{ __html: sanitizeContent(value) }} />
//   );
// };

// // Blog preview component for main page
// export const BlogPreview = () => {
//   const latestPost = mockPosts.sort(
//     (a, b) => new Date(b.date) - new Date(a.date)
//   )[0];

//   return (
//     <Card
//       sx={{
//         maxWidth: 345,
//         m: 2,
//         border: `2px solid ${latestPost.borderColor}`,
//       }}
//     >
//       <CardMedia
//         component="img"
//         height="140"
//         image={latestPost.previewImage}
//         alt={latestPost.title}
//       />
//       <CardContent>
//         <Typography variant="h6">{latestPost.title}</Typography>
//         <Button
//           component={Link}
//           to="/blog"
//           variant="contained"
//           color="primary"
//           sx={{ mt: 1 }}
//         >
//           Читать статью
//         </Button>
//       </CardContent>
//     </Card>
//   );
// };

// export default function Blog() {
//   const [posts, setPosts] = useState(mockPosts);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("");
//   const [expandedPost, setExpandedPost] = useState(null);
//   const [editingPost, setEditingPost] = useState(null);
//   const [editedPost, setEditedPost] = useState({});
//   const [isSaving, setIsSaving] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);

//   const { user, isAuthenticated, getUserInfo, logout } = useUserStore();
//   const isAdmin = isAuthenticated && user?.data.role === "admin";

//   useEffect(() => {
//     // Fetch user info on mount to check authentication and role
//     getUserInfo();
//   }, [getUserInfo]);

//   const categories = [...new Set(mockPosts.map((post) => post.category))];

//   const filteredPosts = useMemo(() => {
//     return posts
//       .filter(
//         (post) =>
//           post.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
//           (categoryFilter === "" || post.category === categoryFilter)
//       )
//       .sort((a, b) => new Date(b.date) - new Date(a.date));
//   }, [posts, searchQuery, categoryFilter]);

//   const handleTogglePost = (id) => {
//     setExpandedPost(expandedPost === id ? null : id);
//   };

//   const handleEditPost = (post) => {
//     if (!isAdmin) {
//       setError("Только администраторы могут редактировать посты");
//       return;
//     }
//     setEditingPost(post.id);
//     setEditedPost({ ...post });
//     setError(null);
//     setSuccess(null);
//   };

//   const handleSavePost = () => {
//     if (!isAdmin) {
//       setError("Только администраторы могут сохранять изменения");
//       return;
//     }
//     setIsSaving(true);
//     setError(null);
//     setSuccess(null);
//     try {
//       // Mock save; replace with API call if backend added
//       setPosts(posts.map((p) => (p.id === editedPost.id ? editedPost : p)));
//       setEditingPost(null);
//       setSuccess("Пост сохранен");
//     } catch (error) {
//       setError("Ошибка при сохранении поста: " + error.message);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleCancelEdit = () => {
//     setEditingPost(null);
//     setEditedPost({});
//   };

//   return (
//     <Box>
//       <Helmet>
//         <title>Блог - СД-МЕД</title>
//         <meta
//           name="description"
//           content="Инструкции, видео и статьи о технических средствах реабилитации и государственной поддержке."
//         />
//         <meta
//           name="keywords"
//           content="блог, инструкции, ТСР, государственная поддержка, видео"
//         />
//       </Helmet>

//       <Container sx={{ py: 4 }}>
//         {/* Search and Filter */}
//         <Box sx={{ mb: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
//           <TextField
//             label="Поиск по заголовку"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             variant="outlined"
//             sx={{ flex: 1, minWidth: 200 }}
//           />
//           <Select
//             value={categoryFilter}
//             onChange={(e) => setCategoryFilter(e.target.value)}
//             displayEmpty
//             sx={{ minWidth: 150 }}
//           >
//             <MenuItem value="">Все категории</MenuItem>
//             {categories.map((category) => (
//               <MenuItem key={category} value={category}>
//                 {category}
//               </MenuItem>
//             ))}
//           </Select>
//         </Box>

//         {error && (
//           <Alert severity="error" sx={{ mb: 2 }}>
//             {error}
//           </Alert>
//         )}
//         {success && (
//           <Alert severity="success" sx={{ mb: 2 }}>
//             {success}
//           </Alert>
//         )}

//         {/* Blog Posts */}
//         <Grid container spacing={3}>
//           {filteredPosts.map((post) => (
//             <Grid item xs={12} md={6} key={post.id}>
//               <Card
//                 sx={{ border: `2px solid ${post.borderColor}`, boxShadow: 3 }}
//               >
//                 <CardMedia
//                   component="img"
//                   height="200"
//                   image={post.previewImage}
//                   alt={post.title}
//                 />
//                 <CardContent>
//                   <Typography variant="h6">{post.title}</Typography>
//                   <Typography variant="caption" color="text.secondary">
//                     {post.category} | {new Date(post.date).toLocaleDateString()}
//                   </Typography>
//                   <Collapse in={expandedPost === post.id}>
//                     <Box sx={{ mt: 2 }}>
//                       {editingPost === post.id && isAdmin ? (
//                         <>
//                           <TextField
//                             label="Заголовок"
//                             value={editedPost.title}
//                             onChange={(e) =>
//                               setEditedPost({
//                                 ...editedPost,
//                                 title: e.target.value,
//                               })
//                             }
//                             fullWidth
//                             sx={{ mb: 2 }}
//                           />
//                           <EditableHtmlField
//                             value={editedPost.content}
//                             onChange={(value) =>
//                               setEditedPost({ ...editedPost, content: value })
//                             }
//                             isEditing={true}
//                             isAdmin={isAdmin}
//                           />
//                           <TextField
//                             label="URL изображения превью"
//                             value={editedPost.previewImage}
//                             onChange={(e) =>
//                               setEditedPost({
//                                 ...editedPost,
//                                 previewImage: e.target.value,
//                               })
//                             }
//                             fullWidth
//                             sx={{ mb: 2 }}
//                           />
//                           <TextField
//                             label="Дата (ГГГГ-ММ-ДД)"
//                             value={editedPost.date}
//                             onChange={(e) =>
//                               setEditedPost({
//                                 ...editedPost,
//                                 date: e.target.value,
//                               })
//                             }
//                             fullWidth
//                             sx={{ mb: 2 }}
//                           />
//                           <Select
//                             value={editedPost.category}
//                             onChange={(e) =>
//                               setEditedPost({
//                                 ...editedPost,
//                                 category: e.target.value,
//                               })
//                             }
//                             fullWidth
//                             sx={{ mb: 2 }}
//                           >
//                             {categories.map((category) => (
//                               <MenuItem key={category} value={category}>
//                                 {category}
//                               </MenuItem>
//                             ))}
//                           </Select>
//                           <TextField
//                             label="Цвет окантовки (hex)"
//                             value={editedPost.borderColor}
//                             onChange={(e) =>
//                               setEditedPost({
//                                 ...editedPost,
//                                 borderColor: e.target.value,
//                               })
//                             }
//                             fullWidth
//                             sx={{ mb: 2 }}
//                           />
//                           <Box sx={{ display: "flex", gap: 1 }}>
//                             <Button
//                               variant="contained"
//                               startIcon={<SaveIcon />}
//                               onClick={handleSavePost}
//                               disabled={isSaving}
//                             >
//                               {isSaving ? (
//                                 <CircularProgress size={24} />
//                               ) : (
//                                 "Сохранить"
//                               )}
//                             </Button>
//                             <Button
//                               variant="outlined"
//                               startIcon={<CancelIcon />}
//                               onClick={handleCancelEdit}
//                             >
//                               Отменить
//                             </Button>
//                           </Box>
//                         </>
//                       ) : (
//                         <EditableHtmlField
//                           value={post.content}
//                           isEditing={false}
//                           isAdmin={isAdmin}
//                         />
//                       )}
//                     </Box>
//                   </Collapse>
//                   <Box
//                     sx={{
//                       mt: 2,
//                       display: "flex",
//                       justifyContent: "space-between",
//                     }}
//                   >
//                     <Button
//                       onClick={() => handleTogglePost(post.id)}
//                       endIcon={
//                         expandedPost === post.id ? (
//                           <ExpandLessIcon />
//                         ) : (
//                           <ExpandMoreIcon />
//                         )
//                       }
//                     >
//                       {expandedPost === post.id ? "Свернуть" : "Читать"}
//                     </Button>
//                     {isAdmin && (
//                       <Button
//                         startIcon={<EditIcon />}
//                         onClick={() => handleEditPost(post)}
//                         disabled={editingPost === post.id}
//                       >
//                         Редактировать
//                       </Button>
//                     )}
//                   </Box>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       </Container>
//     </Box>
//   );
// }
