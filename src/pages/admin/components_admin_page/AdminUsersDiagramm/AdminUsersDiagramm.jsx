import React, { useEffect, useState } from "react";
import useUserStore from "../../../../store/userStore";
import { Box, Container, Paper, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AdminUsersDiagramm() {
  const { fetchUsers, allUsers } = useUserStore();
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (allUsers && allUsers.data && Array.isArray(allUsers.data.users)) {
      setFilteredUsers(allUsers.data.users);
      // Обновляем данные для диаграммы
      const growthData = allUsers.data.users.map((user, index) => ({
        name: `Пользователь ${index + 1}`,
        count: index + 1,
      }));
      setUserGrowthData(growthData);
    }
  }, [allUsers]);

  return (
    <Container>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography sx={{ fontSize: "20px", mb: 2, fontWeight: "bold" }}>
          Рост пользователей
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={userGrowthData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#4CAF50" // Зелёный цвет
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <Typography sx={{ fontSize: "20px", mb: 2, mt: 2, color: "green" }}>
          Всего пользователей : ({allUsers?.data?.count || 0})
        </Typography>
      </Paper>
    </Container>
  );
}
