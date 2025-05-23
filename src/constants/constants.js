export const url = import.meta.env.VITE_URL_SERVER;
export const urlPictures = import.meta.env.VITE_URL_PICTURES;
export const chat = import.meta.env.VITE_URL_CHAT;
console.log(url);

// const YANDEX_API_KEY = "1fe0be30-02a2-4c9c-b6f9-31cbadd264db"; // Замените на ваш ключ

// const findRegionByName = (regionName) => {
//   return Regions.find((region) => region.name === regionName);
// };

// const getRegionFromCoordinates = async (latitude, longitude) => {
//   const url = `https://geocode-maps.yandex.ru/1.x/?format=json&apikey=${YANDEX_API_KEY}&geocode=${longitude},${latitude}`;

//   try {
//     const response = await axios.get(url);
//     const data = response.data;

//     // Поиск региона в ответе
//     const featureMember = data.response.GeoObjectCollection.featureMember;
//     if (featureMember.length > 0) {
//       const addressComponents =
//         featureMember[0].GeoObject.metaDataProperty.GeocoderMetaData.Address
//           .Components;
//       const region = addressComponents.find(
//         (component) =>
//           component.kind === "province" || component.kind === "region"
//       );

//       if (region) {
//         // Ищем регион в вашем списке
//         const matchedRegion = findRegionByName(region.name);
//         return matchedRegion || null;
//       }
//     }
//   } catch (error) {
//     console.error("Ошибка при определении региона:", error);
//   }
//   return null;
// };

// useEffect(() => {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const region = await getRegionFromCoordinates(
//           position.coords.latitude,
//           position.coords.longitude
//         );
//         if (region) {
//           setNewRegion(region); // Обновляем состояние региона
//           // Автоматически отправляем запрос на сервер с регионом
//           fetchProductById(id, region.value);
//         }
//       },
//       (error) => {
//         console.error("Ошибка при получении местоположения:", error);
//       }
//     );
//   } else {
//     console.error("Геолокация не поддерживается вашим браузером.");
//   }
// }, [id]);
