export interface Voice {
  id: string;
  name: string;
  description: string;
}

export const voices: Voice[] = [
  { id: 'female-north-standard', name: 'Nữ miền Bắc (Chuẩn)', description: 'Giọng nữ miền Bắc chuẩn, rõ ràng, phù hợp cho tin tức, thông báo.' },
  { id: 'male-north-warm', name: 'Nam miền Bắc (Trầm ấm)', description: 'Giọng nam miền Bắc trầm, ấm áp, đáng tin cậy, phù hợp kể chuyện, quảng cáo.' },
  { id: 'female-south-natural', name: 'Nữ miền Nam (Tự nhiên)', description: 'Giọng nữ miền Nam tự nhiên, thân thiện, phù hợp cho vlog, review.' },
  { id: 'male-south-energetic', name: 'Nam miền Nam (Mạnh mẽ)', description: 'Giọng nam miền Nam mạnh mẽ, dứt khoát, phù hợp cho video hành động, thể thao.' },
  { id: 'female-hue-gentle', name: 'Nữ Huế (Nhẹ nhàng)', description: 'Giọng nữ Huế nhẹ nhàng, truyền cảm, mang lại cảm giác yên bình.' },
  { id: 'male-hue-calm', name: 'Nam Huế (Trầm lắng)', description: 'Giọng nam Huế trầm, chậm rãi, phù hợp cho nội dung về văn hóa, lịch sử.' },
  { id: 'female-young-energetic', name: 'Giọng nữ trẻ (Năng động)', description: 'Giọng nữ trẻ trung, năng động, nhiệt huyết, phù hợp giới trẻ.' },
  { id: 'male-young-friendly', name: 'Giọng nam trẻ (Thân thiện)', description: 'Giọng nam trẻ trung, gần gũi, phù hợp video giải trí, đời sống.' },
  { id: 'female-middle-aged-professional', name: 'Nữ trung niên (Chuyên nghiệp)', description: 'Giọng nữ trung niên chững chạc, chuyên nghiệp, phù hợp nội dung doanh nghiệp, đào tạo.' },
  { id: 'male-middle-aged-persuasive', name: 'Nam trung niên (Thuyết phục)', description: 'Giọng nam trung niên có sức nặng, thuyết phục, phù hợp cho bài bán hàng, diễn thuyết.' },
  { id: 'grandma-storyteller', name: 'Giọng kể chuyện (Bà)', description: 'Giọng bà cụ ấm áp, hiền từ, chuyên kể chuyện cổ tích, truyền thống.' },
  { id: 'grandpa-storyteller', name: 'Giọng kể chuyện (Ông)', description: 'Giọng ông cụ trầm, từ tốn, mang lại cảm giác thông thái, uyên bác.' },
  { id: 'female-news-anchor', name: 'Nữ phát thanh viên', description: 'Giọng chuẩn xác, rõ ràng của một phát thanh viên chuyên nghiệp.' },
  { id: 'male-news-anchor', name: 'Nam phát thanh viên', description: 'Giọng dõng dạc, uy tín của một phát thanh viên chuyên nghiệp.' },
  { id: 'female-ad-voice', name: 'Giọng quảng cáo (Nữ)', description: 'Giọng nữ tươi tắn, thu hút, chuyên dùng cho quảng cáo sản phẩm.' },
  { id: 'male-ad-voice', name: 'Giọng quảng cáo (Nam)', description: 'Giọng nam mạnh mẽ, ấn tượng, chuyên dùng cho quảng cáo thương hiệu.' },
  { id: 'child-girl', name: 'Giọng bé gái', description: 'Giọng bé gái trong trẻo, ngây thơ.' },
  { id: 'child-boy', name: 'Giọng bé trai', description: 'Giọng bé trai tinh nghịch, đáng yêu.' },
  { id: 'robot-female', name: 'Giọng Robot (Nữ)', description: 'Giọng robot nữ, máy móc, không cảm xúc.' },
  { id: 'robot-male', name: 'Giọng Robot (Nam)', description: 'Giọng robot nam, máy móc, mạnh mẽ.' },
  
  // --- TVC Professional Voices ---
  // Female
  { id: 'tvc-female-elegant', name: 'Nữ MC TVC (Thanh Lịch)', description: 'Giọng nữ cao cấp, sang trọng. Lý tưởng cho các thương hiệu xa xỉ, mỹ phẩm, thời trang.' },
  { id: 'tvc-female-energetic', name: 'Nữ MC TVC (Năng Động)', description: 'Giọng nữ trẻ trung, đầy sức sống. Hoàn hảo cho sản phẩm công nghệ, du lịch, giới trẻ.' },
  { id: 'tvc-female-inspirational', name: 'Nữ MC TVC (Truyền Cảm)', description: 'Giọng nữ ấm áp, truyền cảm hứng. Thích hợp cho các chiến dịch cộng đồng, sản phẩm gia đình.' },
  { id: 'tvc-female-authoritative', name: 'Nữ MC TVC (Quyền Uy)', description: 'Giọng nữ chuyên nghiệp, dứt khoát. Dành cho các lĩnh vực tài chính, công nghệ, dược phẩm.' },
  { id: 'tvc-female-friendly', name: 'Nữ MC TVC (Thân Thiện)', description: 'Giọng nữ vui vẻ, gần gũi. Phù hợp cho ngành hàng tiêu dùng nhanh (FMCG), khuyến mãi.' },
  { id: 'tvc-female-charming', name: 'Nữ MC TVC (Quyến Rũ)', description: 'Giọng nữ bí ẩn, lôi cuốn. Tuyệt vời cho quảng cáo nước hoa, trang sức, sự kiện đêm.' },
  { id: 'tvc-female-caring', name: 'Nữ MC TVC (Quan Tâm)', description: 'Giọng người mẹ dịu dàng, đáng tin cậy. Chuyên cho các sản phẩm mẹ và bé, chăm sóc sức khỏe.' },
  { id: 'tvc-female-southern-sweet', name: 'Nữ MC TVC (Nam Bộ Ngọt Ngào)', description: 'Giọng nữ miền Nam ngọt ngào, duyên dáng. Phù hợp cho ẩm thực, du lịch miền Tây.' },
  { id: 'tvc-female-northern-standard', name: 'Nữ MC TVC (Bắc Bộ Chuẩn Mực)', description: 'Giọng nữ miền Bắc chuẩn mực, trang trọng. Dùng trong các thông báo quan trọng, quảng cáo cấp nhà nước.' },
  { id: 'tvc-female-storyteller', name: 'Nữ MC TVC (Kể Chuyện)', description: 'Giọng kể chuyện lôi cuốn, có chiều sâu. Dành cho các quảng cáo có cốt truyện, cảm xúc.' },

  // Male
  { id: 'tvc-male-luxury', name: 'Nam MC TVC (Lịch Lãm)', description: 'Giọng nam trầm ấm, đẳng cấp. Dành cho xe hơi hạng sang, đồng hồ, bất động sản cao cấp.' },
  { id: 'tvc-male-powerful', name: 'Nam MC TVC (Mạnh Mẽ)', description: 'Giọng nam khỏe khoắn, đầy nội lực. Thích hợp cho đồ thể thao, nước tăng lực, game.' },
  { id: 'tvc-male-trustworthy', name: 'Nam MC TVC (Đáng Tin Cậy)', description: 'Giọng nam chân thành, thuyết phục. Lý tưởng cho ngành bảo hiểm, ngân hàng, y tế.' },
  { id: 'tvc-male-witty', name: 'Nam MC TVC (Hóm Hỉnh)', description: 'Giọng nam thông minh, hài hước. Tuyệt vời cho các sản phẩm công nghệ, viễn thông, ứng dụng di động.' },
  { id: 'tvc-male-brand-voice', name: 'Nam MC TVC (Giọng Thương Hiệu)', description: 'Giọng nam hùng hồn, ấn tượng, dễ nhận diện. Dùng để xây dựng hình ảnh thương hiệu lớn.' },
  { id: 'tvc-male-southern-charming', name: 'Nam MC TVC (Nam Bộ Phong Độ)', description: 'Giọng nam miền Nam phóng khoáng, tự tin. Phù hợp cho sản phẩm dành cho phái mạnh, bia, cà phê.' },
  { id: 'tvc-male-northern-resonant', name: 'Nam MC TVC (Bắc Bộ Dõng Dạc)', description: 'Giọng nam miền Bắc vang, rõ ràng. Dùng cho các quảng cáo mang tính kêu gọi, thông điệp lớn.' },
  { id: 'tvc-male-movie-trailer', name: 'Nam MC TVC (Giọng Phim)', description: 'Giọng nam kịch tính, hoành tráng như trailer phim. Tạo hiệu ứng mạnh cho các sản phẩm mới ra mắt.' },
  { id: 'tvc-male-expert', name: 'Nam MC TVC (Chuyên Gia)', description: 'Giọng nam điềm tĩnh, am hiểu. Dành cho các sản phẩm cần giải thích tính năng, công dụng chuyên sâu.' },
  { id: 'tvc-male-trendy', name: 'Nam MC TVC (Bắt Trend)', description: 'Giọng nam trẻ trung, hiện đại. Thích hợp cho các quảng cáo trên mạng xã hội, sản phẩm cho gen Z.' }
];
