// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Box,
//   Container,
//   Typography,
//   TextField,
//   Button,
//   Alert,
//   CircularProgress,
//   Grid,
//   Card,
//   CardMedia,
//   CardContent,
// } from "@mui/material";
// import SaveIcon from "@mui/icons-material/Save";
// import EditIcon from "@mui/icons-material/Edit";
// import CancelIcon from "@mui/icons-material/Cancel";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { toast } from "react-toastify";
// import useUserStore from "../../../store/userStore";
// import api from "../../../configs/axiosConfig";
// import EditableHtmlField from "../../../global/components/EditableHtmlField";

// // Валидация hex-цвета
// // const isValidHex = (hex) => /^#[0-9A-Fa-f]{6}$/i.test(hex);

// // Обработчик загрузки изображения превью
// async function handlePreviewImageUpload(file,
//   setNewPost,
//   setIsUploadingPreview,
//   setError) {
//   if (!file) return;
//   setIsUploadingPreview(true);
//   try {
//     const formData = new FormData();
//     formData.append("image", file);
//     const response = await api.post("/blog/upload", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     const imageUrl = response.data.url;
//     setNewPost((prev) => ({ ...prev, preview: imageUrl }));
//     toast.success("Изображение превью успешно загружено");
//   } catch (error) {
//     setError(
//       "Ошибка загрузки изображения превью: " +
//       (error.response?.data?.message || error.message)
//     );
//     toast.error("Ошибка загрузки изображения превью");
//   } finally {
//     setIsUploadingPreview(false);
//   }
// }

// export default function BlogAdminPanel() {
//   const [posts, setPosts] = useState([]);
//   const [newPost, setNewPost] = useState({
//     preview: "",
//     text: "",
//     hex: "#000000",
//   });
//   const [editingPost, setEditingPost] = useState(null);
//   const [editedPost, setEditedPost] = useState({});
//   const [isSaving, setIsSaving] = useState(false);
//   const [isUploadingPreview, setIsUploadingPreview] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);

//   const { user, isAuthenticated, getUserInfo } = useUserStore();

//   useEffect(() => {
//     // Проверка доступа и загрузка постов
//     getUserInfo();
//     const fetchPosts = async () => {
//       try {
//         const response = await api.get("/blog");
//         setPosts(response.data.data);
//       } catch (error) {
//         setError(
//           "Ошибка загрузки постов: " +
//             (error.response?.data?.message || error.message)
//         );
//       }
//     };
//     fetchPosts();
//   }, []);

//   const handleCreatePost = async () => {
//     if (!newPost.preview || !newPost.text || !isValidHex(newPost.hex)) {
//       setError(
//         "Заполните все поля корректно (hex должен быть в формате #RRGGBB)"
//       );
//       return;
//     }
//     setIsSaving(true);
//     setError(null);
//     setSuccess(null);
//     try {
//       const response = await api.post("/blog", {
//         preview: newPost.preview,
//         text: newPost.text,
//         hex: newPost.hex,
//       });
//       setPosts([...posts, response.data.data]);
//       setNewPost({ preview: "", text: "", hex: "#000000" });
//       setSuccess("Пост успешно создан");
//       toast.success("Пост успешно создан");
//     } catch (error) {
//       setError(
//         "Ошибка создания поста: " +
//           (error.response?.data?.message || error.message)
//       );
//       toast.error("Ошибка создания поста");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleEditPost = (post) => {
//     setEditingPost(post.id);
//     setEditedPost({ ...post });
//     setError(null);
//     setSuccess(null);
//   };

//   const handleSaveEdit = async () => {
//     if (
//       !editedPost.preview ||
//       !editedPost.text ||
//       !isValidHex(editedPost.hex)
//     ) {
//       setError(
//         "Заполните все поля корректно (hex должен быть в формате #RRGGBB)"
//       );
//       return;
//     }
//     setIsSaving(true);
//     setError(null);
//     setSuccess(null);
//     try {
//       const response = await api.put(`/blog/${editedPost.id}`, {
//         preview: editedPost.preview,
//         text: editedPost.text,
//         hex: editedPost.hex,
//       });
//       setPosts(
//         posts.map((p) => (p.id === editedPost.id ? response.data.data : p))
//       );
//       setEditingPost(null);
//       setEditedPost({});
//       setSuccess("Пост обновлен");
//       toast.success("Пост успешно обновлен");
//     } catch (error) {
//       setError(
//         "Ошибка обновления поста: " +
//           (error.response?.data?.message || error.message)
//       );
//       toast.error("Ошибка обновления поста");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDeletePost = async (id) => {
//     setIsSaving(true);
//     setError(null);
//     setSuccess(null);
//     try {
//       await api.delete(`/blog/${id}`);
//       setPosts(posts.filter((p) => p.id !== id));
//       setSuccess("Пост удален");
//       toast.success("Пост успешно удален");
//     } catch (error) {
//       setError(
//         "Ошибка удаления поста: " +
//           (error.response?.data?.message || error.message)
//       );
//       toast.error("Ошибка удаления поста");
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
//       <Container sx={{ py: 4 }}>
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

//         {/* Создание нового поста */}
//         <Box
//           sx={{
//             mb: 4,
//             p: 3,
//             bgcolor: "background.paper",
//             borderRadius: 2,
//             boxShadow: 1,
//           }}
//         >
//           <Typography variant="h6" gutterBottom>
//             Создать новый пост
//           </Typography>
//           <Box sx={{ mb: 2 }}>
//             <Button
//               variant="contained"
//               component="label"
//               disabled={isUploadingPreview}
//               startIcon={
//                 isUploadingPreview ? <CircularProgress size={24} /> : null
//               }
//             >
//               Загрузить изображение превью
//               <input
//                 type="file"
//                 accept="image/*"
//                 hidden
//                 onChange={(e) =>
//                   handlePreviewImageUpload(
//                     e.target.files[0],
//                     setNewPost,
//                     setIsUploadingPreview,
//                     setError
//                   )
//                 }
//               />
//             </Button>
//             {newPost.preview && (
//               <Box sx={{ mt: 2 }}>
//                 <Typography variant="body2" gutterBottom>
//                   Ссылка на изображение превью:
//                 </Typography>
//                 <TextField
//                   value={newPost.preview}
//                   fullWidth
//                   InputProps={{ readOnly: true }}
//                   variant="outlined"
//                   size="small"
//                 />
//               </Box>
//             )}
//           </Box>
//           <Typography variant="h6" gutterBottom>
//             Содержимое поста
//           </Typography>
//           <EditableHtmlField
//             value={newPost.text}
//             setValue={(value) => setNewPost({ ...newPost, text: value })}
//             isEditing={true}
//           />
//           <TextField
//             label="Цвет окантовки (hex, #RRGGBB)"
//             value={newPost.hex}
//             onChange={(e) => setNewPost({ ...newPost, hex: e.target.value })}
//             fullWidth
//             error={newPost.hex && !isValidHex(newPost.hex)}
//             helperText={
//               newPost.hex && !isValidHex(newPost.hex)
//                 ? "Введите корректный hex-цвет (#RRGGBB)"
//                 : ""
//             }
//             sx={{ mb: 2 }}
//           />
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleCreatePost}
//             disabled={isSaving || isUploadingPreview}
//             startIcon={isSaving ? <CircularProgress size={24} /> : <SaveIcon />}
//             sx={{ mt: 2 }}
//           >
//             Создать пост
//           </Button>
//         </Box>

//         {/* Существующие посты */}
//         <Typography variant="h6" gutterBottom>
//           Существующие посты
//         </Typography>
//         <Grid container spacing={3}>
//           {posts.map((post) => (
//             <Grid item xs={12} key={post.id}>
//               <Card sx={{ border: `2px solid ${post.hex}`, boxShadow: 3 }}>
//                 <CardMedia
//                   component="img"
//                   height="200"
//                   image={post.preview}
//                   alt="Превью поста"
//                 />
//                 <CardContent>
//                   <Typography variant="caption" color="text.secondary">
//                     {post.category} | {new Date(post.date).toLocaleDateString()}
//                   </Typography>
//                   <Box sx={{ mt: 2 }}>
//                     {editingPost === post.id ? (
//                       <>
//                         <TextField
//                           label="URL изображения превью"
//                           value={editedPost.preview}
//                           onChange={(e) =>
//                             setEditedPost({
//                               ...editedPost,
//                               preview: e.target.value,
//                             })
//                           }
//                           fullWidth
//                           sx={{ mb: 2 }}
//                         />
//                         <EditableHtmlField
//                           value={editedPost.text}
//                           setValue={(value) =>
//                             setEditedPost({ ...editedPost, text: value })
//                           }
//                           isEditing={true}
//                         />
//                         <TextField
//                           label="Цвет окантовки (hex, #RRGGBB)"
//                           value={editedPost.hex}
//                           onChange={(e) =>
//                             setEditedPost({
//                               ...editedPost,
//                               hex: e.target.value,
//                             })
//                           }
//                           fullWidth
//                           error={editedPost.hex && !isValidHex(editedPost.hex)}
//                           helperText={
//                             editedPost.hex && !isValidHex(editedPost.hex)
//                               ? "Введите корректный hex-цвет (#RRGGBB)"
//                               : ""
//                           }
//                           sx={{ mb: 2 }}
//                         />
//                         <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
//                           <Button
//                             variant="contained"
//                             startIcon={<SaveIcon />}
//                             onClick={handleSaveEdit}
//                             disabled={isSaving}
//                           >
//                             {isSaving ? (
//                               <CircularProgress size={24} />
//                             ) : (
//                               "Сохранить"
//                             )}
//                           </Button>
//                           <Button
//                             variant="outlined"
//                             startIcon={<CancelIcon />}
//                             onClick={handleCancelEdit}
//                           >
//                             Отменить
//                           </Button>
//                           <Button
//                             variant="outlined"
//                             color="error"
//                             startIcon={<DeleteIcon />}
//                             onClick={() => handleDeletePost(post.id)}
//                             disabled={isSaving}
//                           >
//                             Удалить
//                           </Button>
//                         </Box>
//                       </>
//                     ) : (
//                       <EditableHtmlField value={post.text} isEditing={false} />
//                     )}
//                   </Box>
//                   {!editingPost && (
//                     <Button
//                       startIcon={<EditIcon />}
//                       onClick={() => handleEditPost(post)}
//                       disabled={isSaving}
//                       sx={{ mt: 2 }}
//                     >
//                       Редактировать
//                     </Button>
//                   )}
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       </Container>
//     </Box>
//   );
// }
