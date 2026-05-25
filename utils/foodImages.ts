import type { FoodSearchItem } from "@/types/food";

const COMMONS = "https://commons.wikimedia.org/wiki/Special:FilePath";
const UNSPLASH = "https://source.unsplash.com/featured/320x240";

const FOOD_IMAGE_BY_NAME: Record<string, string> = {
  "com trang": searchPhoto("steamed white rice bowl food"),
  "com gao lut": searchPhoto("cooked brown rice bowl food"),
  "bun tuoi": searchPhoto("vietnamese rice vermicelli noodles"),
  "pho tuoi": searchPhoto("fresh pho rice noodles"),
  "banh mi trang": searchPhoto("white baguette bread"),
  "xoi trang": searchPhoto("sticky rice bowl"),
  "khoai lang luoc": searchPhoto("boiled sweet potato food"),
  "khoai tay luoc": searchPhoto("boiled potatoes food"),
  "ngo luoc": searchPhoto("boiled corn on the cob"),
  "chao trang": searchPhoto("plain rice porridge congee"),
  "mien dong nau chin": searchPhoto("glass noodles cooked food"),
  "nui luoc": searchPhoto("boiled macaroni pasta"),
  "uc ga chin bo da": searchPhoto("cooked chicken breast food"),
  "dui ga chin bo da": searchPhoto("cooked chicken thigh food"),
  "thit heo nac chin": searchPhoto("cooked lean pork food"),
  "thit ba chi heo chin": searchPhoto("cooked pork belly food"),
  "thit bo nac chin": searchPhoto("cooked lean beef food"),
  "ca hoi chin": searchPhoto("cooked salmon fillet food"),
  "ca basa chin": searchPhoto("cooked white fish fillet food"),
  "ca thu chin": searchPhoto("cooked mackerel fish food"),
  "tom luoc": searchPhoto("boiled shrimp food"),
  "muc luoc": searchPhoto("boiled squid food"),
  "trung ga luoc": searchPhoto("boiled egg food"),
  "dau hu trang": searchPhoto("plain tofu cubes food"),
  "dau hu chien": searchPhoto("fried tofu food"),
  "sua tuoi khong duong": searchPhoto("glass of milk"),
  "sua chua khong duong": searchPhoto("plain yogurt bowl"),
  "rau muong luoc": searchPhoto("boiled morning glory vegetable"),
  "rau muong xao toi": searchPhoto("stir fried morning glory garlic"),
  "cai thia luoc": searchPhoto("boiled bok choy vegetable"),
  "bong cai xanh luoc": searchPhoto("boiled broccoli food"),
  "ca rot luoc": searchPhoto("boiled carrots food"),
  "ca chua": searchPhoto("fresh tomatoes"),
  "dua leo": searchPhoto("fresh cucumber slices"),
  "nam rom xao": searchPhoto("stir fried mushrooms food"),
  "canh rau ngot": searchPhoto("vietnamese vegetable soup"),
  "chuoi": searchPhoto("banana fruit"),
  "tao": searchPhoto("apple fruit"),
  "cam": searchPhoto("orange fruit"),
  "xoai chin": searchPhoto("ripe mango fruit"),
  "dua hau": searchPhoto("watermelon fruit"),
  "oi": searchPhoto("guava fruit"),
  "bo": searchPhoto("avocado fruit"),
  "thanh long": searchPhoto("dragon fruit"),
  "pho bo": commonsFile("Phở_bò_(39425047901).jpg"),
  "bun bo hue": commonsFile("Bún_bò_Huế_(20201109).jpg"),
  "bun thit nuong": searchPhoto("vietnamese bun thit nuong"),
  "bun cha": commonsFile("Bun_cha_Hanoi.jpg"),
  "com tam suon": commonsFile("Cơm_tấm_sườn_bì_chả.jpg"),
  "hu tieu": searchPhoto("vietnamese hu tieu noodle soup"),
  "mi quang": searchPhoto("vietnamese mi quang noodles"),
  "banh cuon": searchPhoto("vietnamese banh cuon"),
  "goi cuon tom thit": commonsFile("Gỏi_cuốn_(49358210697).jpg"),
  "cha gio chien": searchPhoto("vietnamese fried spring rolls cha gio"),
  "banh xeo": commonsFile("Bánh_xèo.jpg"),
  "banh chung": searchPhoto("vietnamese banh chung"),
  "banh gio": searchPhoto("vietnamese banh gio"),
  "banh bao nhan thit": searchPhoto("steamed pork bun"),
  "banh canh cua": searchPhoto("vietnamese banh canh cua"),
  "chao ga": searchPhoto("vietnamese chicken congee"),
  "canh chua ca": searchPhoto("vietnamese sour fish soup canh chua"),
  "ca kho to": searchPhoto("vietnamese braised fish clay pot"),
  "thit kho trung": searchPhoto("vietnamese caramelized pork and eggs"),
  "ga kho gung": searchPhoto("vietnamese ginger chicken"),
  "bo luc lac": searchPhoto("vietnamese shaking beef bo luc lac"),
  "dau hu sot ca": searchPhoto("tofu tomato sauce food"),
  "trung chien": searchPhoto("fried egg omelette"),
  "rau cu luoc": searchPhoto("boiled mixed vegetables"),
  "salad uc ga": searchPhoto("chicken breast salad"),
  "nuoc cam tuoi": searchPhoto("fresh orange juice"),
  "ca phe sua da": searchPhoto("vietnamese iced coffee milk"),
  "sinh to bo sua": searchPhoto("avocado smoothie"),
};

const CATEGORY_IMAGE_BY_NAME: Record<string, string> = {
  "tinh bot": searchPhoto("rice noodles bread starch food"),
  "mon viet": searchPhoto("vietnamese food dish"),
  "thit ca trung": searchPhoto("cooked protein food"),
  "hai san": searchPhoto("cooked seafood food"),
  "rau cu": searchPhoto("fresh vegetables food"),
  "trai cay": searchPhoto("fresh fruit food"),
  "do uong": searchPhoto("fresh drink beverage"),
  "sua va che pham": searchPhoto("milk yogurt dairy"),
};

export function getFoodImageUri(food: FoodSearchItem): string | null {
  if (food.imageUrl) return food.imageUrl;

  const normalizedName = normalizeText(food.name);
  const normalizedCategory = normalizeText(food.category);

  return (
    FOOD_IMAGE_BY_NAME[normalizedName] ??
    CATEGORY_IMAGE_BY_NAME[normalizedCategory] ??
    searchPhoto(`${food.name} food`)
  );
}

function commonsFile(fileName: string) {
  return `${COMMONS}/${encodeURIComponent(fileName)}?width=320`;
}

function searchPhoto(query: string) {
  return `${UNSPLASH}/?${encodeURIComponent(query)}`;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
