export interface Emotion {
  id: string;
  name: string;
  description: string;
}

export const emotions: Emotion[] = [
    { id: 'warm-and-friendly', name: 'Ấm áp và thân thiện', description: 'Giọng nói nhẹ nhàng, gần gũi như một người bạn đang trò chuyện.' },
    { id: 'energetic-and-enthusiastic', name: 'Năng động và nhiệt huyết', description: 'Giọng đầy năng lượng, tràn đầy cảm hứng, thích hợp cho quảng cáo.' },
    { id: 'calm-and-soothing', name: 'Trầm tĩnh và dễ chịu', description: 'Giọng nói chậm rãi, nhẹ nhàng, mang lại cảm giác thư giãn.' },
    { id: 'confident-and-persuasive', name: 'Tự tin và thuyết phục', description: 'Giọng nói chắc chắn, có trọng lực – phù hợp cho bài pitch bán hàng.' },
    { id: 'natural-and-conversational', name: 'Tự nhiên và đời thường', description: 'Giống như đang trò chuyện với người nghe, rất chân thật và thoải mái.' },
    { id: 'professional-and-informative', name: 'Chuyên nghiệp và truyền cảm', description: 'Rõ ràng, súc tích, truyền tải thông tin dễ hiểu.' },
    { id: 'storytelling-and-emotional', name: 'Kể chuyện đầy cảm xúc', description: 'Lên – xuống giọng mượt mà, nhấn nhá theo nhịp câu chuyện.' },
    { id: 'playful-and-cheerful', name: 'Vui tươi và nghịch ngợm', description: 'Nhẹ nhàng, tinh nghịch, dễ gây thiện cảm – lý tưởng cho nội dung giải trí.' },
    { id: 'empathetic-and-caring', name: 'Đồng cảm và quan tâm', description: 'Nhẹ nhàng, cảm thông, như đang an ủi hoặc động viên người nghe.' },
    { id: 'urgent-and-attention-grabbing', name: 'Khẩn cấp và thu hút', description: 'Dứt khoát, có cảm giác "không thể bỏ qua", hay dùng trong quảng cáo Flash sale.' },
    { id: 'romantic-and-tender', name: 'Lãng mạn và dịu dàng', description: 'Giọng nhẹ nhàng, sâu lắng, gợi cảm xúc yêu thương.' },
    { id: 'gentle-and-magical-for-children', name: 'Nhẹ nhàng và huyền ảo (Thiếu nhi)', description: 'Giọng trong trẻo, nhẹ nhàng, mang hơi hướng cổ tích.' },
    { id: 'spooky-and-mysterious', name: 'Ma quái và bí ẩn', description: 'Giọng trầm, thì thầm, tạo cảm giác hồi hộp.' },
    { id: 'inspiring-and-cinematic', name: 'Truyền cảm hứng và điện ảnh', description: 'Giọng đậm chất điện ảnh, cảm xúc mạnh mẽ, kích thích suy ngẫm.' },
    { id: 'dramatic-and-intense', name: 'Kịch tính và dồn dập', description: 'Lên cao – xuống thấp rõ ràng, tạo nhịp nhanh, mạnh.' },
];