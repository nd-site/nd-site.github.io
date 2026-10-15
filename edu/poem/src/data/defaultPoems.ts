import type { Poem } from '../types';

export const DEFAULT_POEMS: Poem[] = [
  {
    id: 'tay-tien-quang-dung',
    slug: 'tay-tien',
    title: 'Tây Tiến',
    author: 'Quang Dũng',
    authorNdid: 'ndlabs',
    genre: 'Thơ 7 chữ',
    category: 'Chương trình THPT',
    meaning: 'Bài thơ tái hiện chặng đường hành quân gian khổ nhưng đầy hào hùng, lãng mạn của đoàn binh Tây Tiến giữa núi rừng Tây Bắc hùng vĩ, qua đó ngợi ca vẻ đẹp bi tráng và tâm hồn hào hoa của người lính.',
    likesCount: 0,
    likedBy: [],
    savesCount: 0,
    viewsCount: 0,
    createdAt: '2026-03-01T08:00:00Z',
    createdBy: {
      uid: 'nd-labs-official',
      displayName: 'ND Labs Biên soạn',
      ndid: 'ndlabs',
      avatar: '/assets/images/logo.png'
    },
    isPublic: true,
    visibility: 'public',
    isLocked: false,
    allowComments: true,
    collaboratorNdids: [],
    tags: ['Ngữ Văn 12', 'Kháng chiến', 'Hào hùng', 'Tây Bắc'],
    stanzas: [
      {
        stanzaIndex: 1,
        lines: [
          'Sông Mã xa rồi Tây Tiến ơi!',
          'Nhớ về rừng núi, nhớ chơi vơi.',
          'Sài Khao sương lấp đoàn quân mỏi,',
          'Mường Lát hoa về trong đêm hơi.'
        ],
        rhythm: '4/3',
        visualCue: 'Dòng sông Mã cuồn cuộn chảy qua núi rừng Tây Bắc bảng lảng khói sương huyền ảo',
        rhymeMapping: {
          'ơi': 'A',
          'chơi vơi': 'A',
          'mỏi': 'B',
          'hơi': 'A'
        }
      },
      {
        stanzaIndex: 2,
        lines: [
          'Dốc lên khúc khuỷu dốc thăm thẳm,',
          'Heo hút cồn mây, súng ngửi trời.',
          'Ngàn thước lên cao, ngàn thước xuống,',
          'Nhà ai Pha Luông mưa xa khơi.'
        ],
        rhythm: '4/3',
        visualCue: 'Đỉnh núi cao chót vót chọc thủng mây trời, phía xa là thung lũng mưa bay lất phất ấm cúng',
        rhymeMapping: {
          'thăm thẳm': 'C',
          'trời': 'A',
          'xuống': 'D',
          'khơi': 'A'
        }
      },
      {
        stanzaIndex: 3,
        lines: [
          'Anh bạn dãi dầu không bước nữa,',
          'Gục lên bao súng quên đời!',
          'Chiều chiều oai linh thác gầm thét,',
          'Đêm đêm Mường Hịch cọp trêu người.'
        ],
        rhythm: '4/3',
        visualCue: 'Người lính phong trần ngã xuống thanh thản trong hoàng hôn gầm vang tiếng thác rừng thiêng',
        rhymeMapping: {
          'nữa': 'E',
          'đời': 'A',
          'thét': 'F',
          'người': 'A'
        }
      },
      {
        stanzaIndex: 4,
        lines: [
          'Nhớ ôi Tây Tiến cơm lên khói,',
          'Mai Châu mùa em thơm nếp xôi.',
          'Doanh trại bừng lên hội đuốc hoa,',
          'Kìa em xiêm áo tự bao giờ.'
        ],
        rhythm: '4/3',
        visualCue: 'Khói cơm lam ấm nồng bản Mai Châu và đêm liên hoan rực rỡ ánh đuốc hoa rộn rã điệu khèn',
        rhymeMapping: {
          'khói': 'G',
          'xôi': 'H',
          'hoa': 'I',
          'giờ': 'K'
        }
      }
    ]
  },
  {
    id: 'song-xuan-quynh',
    slug: 'song',
    title: 'Sóng',
    author: 'Xuân Quỳnh',
    authorNdid: 'ndlabs',
    genre: 'Thơ 5 chữ',
    category: 'Chương trình THPT',
    meaning: 'Mượn hình tượng sóng nước biển khơi để diễn tả tâm trạng muôn thuở của người phụ nữ khi yêu: vừa dữ dội, cồn cào, vừa tha thiết, thủy chung và khát khao hướng tới tình yêu vĩnh cửu.',
    likesCount: 0,
    likedBy: [],
    savesCount: 0,
    viewsCount: 0,
    createdAt: '2026-03-05T09:30:00Z',
    createdBy: {
      uid: 'nd-labs-official',
      displayName: 'ND Labs Biên soạn',
      ndid: 'ndlabs',
      avatar: '/assets/images/logo.png'
    },
    isPublic: true,
    visibility: 'public',
    isLocked: false,
    allowComments: true,
    collaboratorNdids: [],
    tags: ['Ngữ Văn 12', 'Tình yêu', 'Lãng mạn', 'Nữ tính'],
    stanzas: [
      {
        stanzaIndex: 1,
        lines: [
          'Dữ dội và dịu êm',
          'Ồn ào và lặng lẽ',
          'Sông không hiểu nổi mình',
          'Sóng tìm ra tận bể'
        ],
        rhythm: '2/3',
        visualCue: 'Sóng biển dâng trào muôn đợt với hai trạng thái đối cực giữa bờ bãi đại dương bao la',
        rhymeMapping: {
          'êm': 'A',
          'lẽ': 'B',
          'mình': 'C',
          'bể': 'B'
        }
      },
      {
        stanzaIndex: 2,
        lines: [
          'Ôi con sóng ngày xưa',
          'Và ngày sau vẫn thế',
          'Nỗi khát vọng tình yêu',
          'Bồi hồi trong ngực trẻ'
        ],
        rhythm: '2/3',
        visualCue: 'Trái tim rộn ràng đập theo nhịp sóng vỗ qua ngàn năm muôn đời không đổi thay',
        rhymeMapping: {
          'xưa': 'D',
          'thế': 'B',
          'yêu': 'E',
          'trẻ': 'B'
        }
      },
      {
        stanzaIndex: 3,
        lines: [
          'Trước muôn trùng sóng bể',
          'Em nghĩ về anh, em',
          'Em nghĩ về biển lớn',
          'Từ nơi nào sóng lên?'
        ],
        rhythm: '2/3',
        visualCue: 'Cô gái đứng một mình trước biển xanh bao la, trầm ngâm suy tư về nguồn cội tình yêu',
        rhymeMapping: {
          'bể': 'B',
          'em': 'A',
          'lớn': 'F',
          'lên': 'A'
        }
      },
      {
        stanzaIndex: 4,
        lines: [
          'Sóng bắt đầu từ gió',
          'Gió bắt đầu từ đâu?',
          'Em cũng không biết nữa',
          'Khi nào ta yêu nhau'
        ],
        rhythm: '2/3',
        visualCue: 'Ngọn gió lành thổi nhẹ qua mái tóc, tình yêu êm đềm nảy mầm một cách bí ẩn',
        rhymeMapping: {
          'gió': 'G',
          'đâu': 'H',
          'nữa': 'I',
          'nhau': 'H'
        }
      }
    ]
  },
  {
    id: 'day-thon-vi-da-han-mac-tu',
    slug: 'day-thon-vi-da',
    title: 'Đây Thôn Vĩ Dạ',
    author: 'Hàn Mặc Tử',
    authorNdid: 'ndlabs',
    genre: 'Thơ 7 chữ',
    category: 'Chương trình THPT',
    meaning: 'Bức tranh thiên nhiên xứ Huế thanh tú, trong trẻo đan xen nỗi mặc cảm chia lìa, khao khát kết nối với cuộc đời của thi sĩ họ Hàn trước nghịch cảnh nghiệt ngã.',
    likesCount: 0,
    likedBy: [],
    savesCount: 0,
    viewsCount: 0,
    createdAt: '2026-03-08T11:00:00Z',
    createdBy: {
      uid: 'nd-labs-official',
      displayName: 'ND Labs Biên soạn',
      ndid: 'ndlabs',
      avatar: '/assets/images/logo.png'
    },
    isPublic: true,
    visibility: 'public',
    isLocked: false,
    allowComments: true,
    collaboratorNdids: [],
    tags: ['Ngữ Văn 11', 'Thơ Mới', 'Xứ Huế', 'Tâm trạng'],
    stanzas: [
      {
        stanzaIndex: 1,
        lines: [
          'Sao anh không về chơi thôn Vĩ?',
          'Nhìn nắng hàng cau nắng mới lên.',
          'Vườn ai mướt quá, xanh như ngọc,',
          'Lá trúc che ngang mặt chữ điền.'
        ],
        rhythm: '4/3',
        visualCue: 'Khu vườn thôn Vĩ Dạ mướt xanh tắm mình trong ánh nắng mai thanh khiết ngập tràn sương sớm',
        rhymeMapping: {
          'Vĩ': 'A',
          'lên': 'B',
          'ngọc': 'C',
          'điền': 'B'
        }
      },
      {
        stanzaIndex: 2,
        lines: [
          'Gió theo lối gió, mây đường mây,',
          'Dòng nước buồn thiu, hoa bắp lay...',
          'Thuyền ai đậu bến sông trăng đó,',
          'Có chở trăng về kịp tối nay?'
        ],
        rhythm: '4/3',
        visualCue: 'Con thuyền độc mộc lấp lánh ngập ánh trăng vàng trên dòng sông Hương tĩnh lặng đượm buồn',
        rhymeMapping: {
          'mây': 'D',
          'lay': 'D',
          'đó': 'E',
          'nay': 'D'
        }
      },
      {
        stanzaIndex: 3,
        lines: [
          'Mơ khách đường xa, khách đường xa,',
          'Áo em trắng quá nhìn không ra...',
          'Ở đây sương khói mờ nhân ảnh,',
          'Ai biết tình ai có đậm đà?'
        ],
        rhythm: '4/3',
        visualCue: 'Hình bóng người thương chìm lẫn trong làn sương mù mờ ảo, xa xôi hoài niệm',
        rhymeMapping: {
          'xa': 'F',
          'ra': 'F',
          'ảnh': 'G',
          'đà': 'F'
        }
      }
    ]
  },
  {
    id: 'dong-chi-chinh-huu',
    slug: 'dong-chi',
    title: 'Đồng Chí',
    author: 'Chính Hữu',
    authorNdid: 'ndlabs',
    genre: 'Thơ tự do',
    category: 'Chương trình THPT',
    meaning: 'Khắc họa tình cảm thiêng liêng, gắn bó keo sơn giữa những người lính nông dân cách mạng cùng chung chí hướng, vượt qua mọi gian khổ thiếu thốn của cuộc kháng chiến chống Pháp.',
    likesCount: 0,
    likedBy: [],
    savesCount: 0,
    viewsCount: 0,
    createdAt: '2026-03-10T14:15:00Z',
    createdBy: {
      uid: 'nd-labs-official',
      displayName: 'ND Labs Biên soạn',
      ndid: 'ndlabs',
      avatar: '/assets/images/logo.png'
    },
    isPublic: true,
    visibility: 'public',
    isLocked: false,
    allowComments: true,
    collaboratorNdids: [],
    tags: ['Ngữ Văn 9', 'Kháng chiến', 'Đồng đội', 'Biểu tượng'],
    stanzas: [
      {
        stanzaIndex: 1,
        lines: [
          'Quê hương anh nước mặn, đồng chua',
          'Làng tôi nghèo đất cày lên sỏi đá.',
          'Anh với tôi đôi người xa lạ',
          'Tự phương trời chẳng hẹn quen nhau,',
          'Súng bên súng, đầu sát bên đầu,',
          'Đêm rét chung chăn thành đôi tri kỉ.',
          'Đồng chí!'
        ],
        rhythm: '3/3',
        visualCue: 'Hai người lính từ hai miền quê nghèo quây quần bên bếp lửa chiến hào chia nhau hơi ấm chiếc chăn mỏng',
        rhymeMapping: {
          'chua': 'A',
          'đá': 'B',
          'lạ': 'B',
          'nhau': 'C',
          'đầu': 'C',
          'kỉ': 'D',
          'chí': 'D'
        }
      },
      {
        stanzaIndex: 2,
        lines: [
          'Đêm nay rừng hoang sương muối',
          'Đứng cạnh bên nhau chờ giặc tới',
          'Đầu súng trăng treo.'
        ],
        rhythm: '2/2/2',
        visualCue: 'Khung cảnh rừng đêm lạnh giá, ánh trăng vằng vặc hạ thấp như treo ngay trên đầu mũi súng ngời sáng',
        rhymeMapping: {
          'muối': 'E',
          'tới': 'E',
          'treo': 'F'
        }
      }
    ]
  }
];
