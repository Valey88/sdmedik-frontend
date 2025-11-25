import React, { useEffect, useRef, useState } from "react";
import {
  InputBase,
  Button,
  Box,
  MenuItem,
  Typography,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { debounce } from "lodash";
import useSearchStore from "@/store/searchStore"; // Проверьте правильность пути

const DEBOUNCE_DELAY = 300;

const Search = () => {
  const {
    searchQuery,
    searchSuggestions,
    setSearchQuery,
    setSearchSuggestions,
    search, // Используем обновленную функцию
  } = useSearchStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const inputRef = useRef(null);
  const searchBoxRef = useRef(null);

  const handleSearchInput = (query) => {
    setSearchQuery(query ?? "");
    if (query.trim().length) {
      setIsLoading(true);
      setError(null);
      debouncedSearch(query);
      setIsSuggestionsVisible(true);
    } else {
      setSearchSuggestions([]);
      setIsSuggestionsVisible(false);
    }
  };

  // Дебаунс поиска товаров
  const debouncedSearch = useRef(
    debounce(async (query) => {
      try {
        // ЯВНО передаем тип 'product'
        const suggestions = await search(query, "product");
        setSearchSuggestions(suggestions ?? []);
      } catch (error) {
        console.error("Ошибка при получении подсказок:", error);
        setError("Ошибка поиска.");
        setSearchSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_DELAY)
  ).current;

  const handleSuggestionClick = (suggestion) => {
    // Редирект на товар
    window.location.href = `/product/certificate/${suggestion.id}`;
    setIsSuggestionsVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target)
      ) {
        setIsSuggestionsVisible(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <Box
      ref={searchBoxRef}
      sx={{
        display: "flex",
        alignItems: "center",
        width: { xs: "100%", sm: "58%", md: "80%", lg: "100%" },
        maxWidth: "500px",
        position: "relative",
      }}
    >
      <InputBase
        ref={inputRef}
        placeholder="Поиск по товарам"
        value={searchQuery}
        onChange={(e) => handleSearchInput(e.target.value)}
        onFocus={() => setIsSuggestionsVisible(true)}
        sx={{
          height: "53px",
          width: { xs: "100%", md: "70%" },
          border: "2px solid #87EBEB",
          borderRight: "none",
          pl: "20px",
          fontSize: "16px",
          bgcolor: "#FAFAFA",
        }}
      />
      <Button
        variant="contained"
        sx={{
          height: "53px",
          borderRadius: "0 10px 10px 0",
          bgcolor: "#00B3A4",
          "&:hover": { bgcolor: "#009688" },
        }}
      >
        <SearchIcon fontSize="large" />
      </Button>

      {/* Выпадающий список */}
      {isSuggestionsVisible && searchQuery && (
        <Box
          sx={{
            position: "absolute",
            top: "60px",
            left: 0,
            right: 0,
            bgcolor: "white",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            boxShadow: 3,
            zIndex: 1000,
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Typography sx={{ p: 2, color: "error.main" }}>{error}</Typography>
          ) : searchSuggestions.length > 0 ? (
            searchSuggestions.map((item) => (
              <MenuItem
                key={item.id}
                onClick={() => handleSuggestionClick(item)}
                sx={{ p: 1.5, borderBottom: "1px solid #f0f0f0" }}
              >
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ color: "black" }}
                    fontWeight={500}
                  >
                    {item.name}
                  </Typography>
                  {/* Если есть цена или другое поле, можно добавить сюда */}
                </Box>
              </MenuItem>
            ))
          ) : (
            <Typography sx={{ p: 2, color: "text.secondary" }}>
              Ничего не найдено
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Search;
