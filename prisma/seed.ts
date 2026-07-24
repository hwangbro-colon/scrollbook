import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n: number, hour = 20, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.monthlyReport.deleteMany();
  await prisma.bookClubRating.deleteMany();
  await prisma.bookClubMessage.deleteMany();
  await prisma.bookClubParticipant.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.groupSessionParticipant.deleteMany();
  await prisma.readingSession.deleteMany();
  await prisma.groupSession.deleteMany();
  await prisma.bookClubMeetup.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.vocabEntry.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding users...");
  const [minah, haneul, doyun, seoyeon, jihoo] = await Promise.all([
    prisma.user.create({ data: { name: "정민아", email: "minah@example.com" } }),
    prisma.user.create({ data: { name: "김하늘", email: "haneul@example.com" } }),
    prisma.user.create({ data: { name: "이도윤", email: "doyun@example.com" } }),
    prisma.user.create({ data: { name: "박서연", email: "seoyeon@example.com" } }),
    prisma.user.create({ data: { name: "최지후", email: "jihoo@example.com" } }),
  ]);
  const everyone = [minah, haneul, doyun, seoyeon, jihoo];

  console.log("Seeding books...");
  const [almond, sonagi, wandeuk, flower, animalFarm, giver] = await Promise.all([
    prisma.book.create({ data: { title: "아몬드", author: "손원평", totalPages: 264 } }),
    prisma.book.create({ data: { title: "소나기", author: "황순원", totalPages: 32 } }),
    prisma.book.create({ data: { title: "완득이", author: "김려령", totalPages: 300 } }),
    prisma.book.create({ data: { title: "나는 지금 꽃이다", author: "이장근", totalPages: 152 } }),
    prisma.book.create({ data: { title: "동물농장", author: "조지 오웰", totalPages: 208 } }),
    prisma.book.create({ data: { title: "기억 전달자", author: "로이스 로리", totalPages: 240 } }),
  ]);

  console.log("Seeding solo reading sessions (2 weeks)...");
  // 김하늘: near-perfect streak, richest data -> full monthly report
  const haneulBook = almond;
  let haneulPage = 0;
  for (let i = 13; i >= 0; i--) {
    if (i === 6) continue; // one skipped day, still a strong recent streak
    const start = haneulPage;
    const pagesRead = randomInt(8, 16);
    haneulPage = Math.min(haneulPage + pagesRead, haneulBook.totalPages);
    await prisma.readingSession.create({
      data: {
        userId: haneul.id,
        bookId: haneulBook.id,
        type: "solo",
        startPage: start,
        endPage: haneulPage,
        durationSec: randomInt(360, 900),
        date: daysAgo(i, randomInt(18, 21)),
      },
    });
  }
  // second, completed book for 김하늘
  await prisma.readingSession.create({
    data: {
      userId: haneul.id,
      bookId: sonagi.id,
      type: "solo",
      startPage: 0,
      endPage: sonagi.totalPages,
      durationSec: randomInt(900, 1500),
      date: daysAgo(9, 19, 30),
    },
  });

  // 이도윤: moderate, a few gaps
  let doyunPage = 0;
  for (const i of [12, 11, 9, 8, 7, 5, 3, 2, 0]) {
    const start = doyunPage;
    doyunPage = Math.min(doyunPage + randomInt(6, 14), wandeuk.totalPages);
    await prisma.readingSession.create({
      data: {
        userId: doyun.id,
        bookId: wandeuk.id,
        type: "solo",
        startPage: start,
        endPage: doyunPage,
        durationSec: randomInt(300, 800),
        date: daysAgo(i, randomInt(19, 22)),
      },
    });
  }

  // 박서연: light activity, just starting out
  let seoyeonPage = 0;
  for (const i of [10, 6, 4, 1]) {
    const start = seoyeonPage;
    seoyeonPage = Math.min(seoyeonPage + randomInt(5, 10), flower.totalPages);
    await prisma.readingSession.create({
      data: {
        userId: seoyeon.id,
        bookId: flower.id,
        type: "solo",
        startPage: start,
        endPage: seoyeonPage,
        durationSec: randomInt(300, 600),
        date: daysAgo(i, randomInt(20, 22)),
      },
    });
  }

  // 최지후: consistent every-other-day reader
  let jihooPage = 0;
  for (const i of [13, 11, 9, 7, 5, 3, 1]) {
    const start = jihooPage;
    jihooPage = Math.min(jihooPage + randomInt(7, 13), animalFarm.totalPages);
    await prisma.readingSession.create({
      data: {
        userId: jihoo.id,
        bookId: animalFarm.id,
        type: "solo",
        startPage: start,
        endPage: jihooPage,
        durationSec: randomInt(400, 700),
        date: daysAgo(i, randomInt(17, 20)),
      },
    });
  }

  // 정민아: light activity too, she's a regular user like everyone else
  let minahPage = 0;
  for (const i of [9, 7, 4, 2]) {
    const start = minahPage;
    minahPage = Math.min(minahPage + randomInt(6, 12), wandeuk.totalPages);
    await prisma.readingSession.create({
      data: {
        userId: minah.id,
        bookId: wandeuk.id,
        type: "solo",
        startPage: start,
        endPage: minahPage,
        durationSec: randomInt(300, 700),
        date: daysAgo(i, randomInt(20, 22)),
      },
    });
  }

  console.log("Seeding vocab entries...");
  const vocabByUser: Record<string, [string, string][]> = {
    [haneul.id]: [
      ["함구", "입을 다물고 말을 하지 않음"],
      ["편도체", "감정, 특히 공포 반응을 담당하는 뇌 부위"],
      ["무기력", "어떤 일을 해낼 힘이 없음"],
      ["결여", "있어야 할 것이 빠져서 없음"],
      ["동조", "다른 사람의 의견에 자기 의견을 맞춤"],
      ["고찰", "어떤 것을 깊이 생각하고 살펴봄"],
    ],
    [doyun.id]: [
      ["완곡하다", "말하는 투가 부드럽고 온화하다"],
      ["연민", "불쌍하고 가련하게 여김"],
      ["편견", "공정하지 못하고 한쪽으로 치우친 생각"],
      ["갈등", "서로 목표가 달라 부딪히는 상태"],
    ],
    [seoyeon.id]: [
      ["은유", "빗대어 표현하는 방법"],
      ["여운", "일이 끝난 뒤에도 남아있는 느낌"],
      ["성찰", "자기 마음을 되돌아보며 살핌"],
    ],
    [jihoo.id]: [
      ["독재", "혼자서 모든 권력을 차지함"],
      ["풍자", "빗대어 비판하는 표현 방식"],
      ["체제", "사회를 이루는 질서나 제도"],
      ["억압", "억지로 눌러서 자유롭지 못하게 함"],
      ["혁명", "기존 질서를 뒤엎고 새로 세움"],
    ],
    [minah.id]: [
      ["연대", "여럿이 함께 책임을 지거나 힘을 합침"],
      ["담담하다", "감정 표현이 차분하고 평온하다"],
    ],
  };
  for (const [userId, words] of Object.entries(vocabByUser)) {
    for (let i = 0; i < words.length; i++) {
      const [word, meaning] = words[i];
      await prisma.vocabEntry.create({
        data: {
          userId,
          word,
          meaning,
          memorized: i % 3 !== 0,
          date: daysAgo(randomInt(0, 13)),
        },
      });
    }
  }

  console.log("Seeding online reading sessions...");
  const pastGroup = await prisma.groupSession.create({
    data: {
      bookId: giver.id,
      hostUserId: minah.id,
      schedule: daysAgo(3, 16, 0),
      status: "ended",
      planStartPage: 0,
      planEndPage: 60,
      participants: {
        create: [minah, haneul, doyun, seoyeon, jihoo].map((s, idx) => ({ userId: s.id, turnOrder: idx + 1 })),
      },
    },
  });
  for (const [idx, s] of everyone.entries()) {
    const start = idx * 12;
    await prisma.readingSession.create({
      data: {
        userId: s.id,
        bookId: giver.id,
        type: "online",
        startPage: start,
        endPage: start + randomInt(8, 12),
        durationSec: randomInt(180, 420),
        date: daysAgo(3, 16, 10 + idx * 10),
        groupSessionId: pastGroup.id,
      },
    });
  }

  await prisma.groupSession.create({
    data: {
      bookId: wandeuk.id,
      hostUserId: haneul.id,
      schedule: daysAgo(-1, 16, 0),
      status: "scheduled",
      planStartPage: 0,
      planEndPage: 45,
      participants: {
        create: [haneul, doyun, seoyeon].map((s, idx) => ({ userId: s.id, turnOrder: idx + 1 })),
      },
    },
  });

  console.log("Seeding a group (host + members)...");
  const group = await prisma.group.create({
    data: {
      name: "함께 낭독하는 사람들",
      inviteCode: "READ-3TQ9",
      hostUserId: minah.id,
      members: {
        create: everyone.map((u) => ({ userId: u.id })),
      },
    },
  });

  console.log("Seeding monthly reports...");
  const monthKey = new Date().toISOString().slice(0, 7);

  await prisma.monthlyReport.create({
    data: {
      userId: haneul.id,
      month: monthKey,
      totalMinutes: 178,
      booksCompleted: 1,
      vocabCount: 6,
      summary:
        "이번 달 총 13일 중 12일 낭독에 참여하며 매우 꾸준한 낭독 습관을 보였어요. " +
        "특히 「소나기」를 완독하며 성취감을 느꼈고, 「아몬드」를 읽으며 감정 어휘(편도체, 무기력, 결여 등)를 " +
        "스스로 정리하는 모습이 인상적이었습니다. 낭독 시 문장 끊어읽기가 안정적이며, 등장인물의 감정 변화에 " +
        "따라 목소리 톤을 조절하는 표현력이 눈에 띄게 성장했어요. 다음 달에는 긴 호흡의 장편에 도전해보는 걸 추천해요.",
    },
  });
  await prisma.monthlyReport.create({
    data: {
      userId: doyun.id,
      month: monthKey,
      totalMinutes: 92,
      booksCompleted: 0,
      vocabCount: 4,
      summary:
        "「완득이」를 꾸준히 읽어가고 있으며, 특히 인물 간 갈등이 드러나는 장면에서 " +
        "높은 몰입도를 보였어요. 다소 낭독 간격이 불규칙한 편이라 주 3회 이상의 규칙적인 낭독 습관을 " +
        "형성하면 더 큰 성장이 기대돼요.",
    },
  });
  await prisma.monthlyReport.create({
    data: {
      userId: seoyeon.id,
      month: monthKey,
      totalMinutes: 38,
      booksCompleted: 0,
      vocabCount: 3,
      summary:
        "이번 달 낭독을 막 시작한 단계예요. 시집 「나는 지금 꽃이다」를 통해 " +
        "운율과 은유 표현에 흥미를 보이고 있어, 짧은 시 낭독부터 자신감을 쌓아가는 걸 추천해요.",
    },
  });
  await prisma.monthlyReport.create({
    data: {
      userId: jihoo.id,
      month: monthKey,
      totalMinutes: 65,
      booksCompleted: 0,
      vocabCount: 5,
      summary:
        "이틀에 한 번꼴로 「동물농장」을 규칙적으로 읽고 있어요. 사회 풍자적 표현에 " +
        "관심을 보이며 관련 어휘(풍자, 체제, 억압 등)를 스스로 조사해 어휘 노트에 기록하는 적극성이 돋보여요.",
    },
  });
  await prisma.monthlyReport.create({
    data: {
      userId: minah.id,
      month: monthKey,
      totalMinutes: 44,
      booksCompleted: 0,
      vocabCount: 2,
      summary:
        "그룹을 만들어 다른 사람들의 낭독을 꾸준히 챙기면서도, 본인도 「완득이」를 조금씩 읽어가고 있어요. " +
        "모두를 이끄는 역할까지 겸하고 있는 만큼, 짧게라도 자기만의 낭독 시간을 우선순위로 남겨보는 걸 추천해요.",
    },
  });

  console.log("Seeding offline book club venues...");
  const [studyCafe, bookshop, library] = await Promise.all([
    prisma.venue.create({
      data: {
        name: "북적북적 스터디카페",
        address: "서울 강남구 테헤란로3길 12",
        lat: 37.5005,
        lng: 127.029,
        category: "study_cafe",
        description: "조용한 개인석과 4~6인 모임룸을 갖춘 스터디카페예요.",
      },
    }),
    prisma.venue.create({
      data: {
        name: "고요서가",
        address: "서울 강남구 논현로 45",
        lat: 37.4968,
        lng: 127.0245,
        category: "bookstore",
        description: "매주 낭독 모임이 열리는 아늑한 독립서점이에요.",
      },
    }),
    prisma.venue.create({
      data: {
        name: "행복도서관",
        address: "서울 강남구 삼성로 88",
        lat: 37.499,
        lng: 127.031,
        category: "library",
        description: "무료로 이용 가능한 구립 도서관, 그룹 스터디룸 예약 가능.",
      },
    }),
    prisma.venue.create({
      data: {
        name: "카페 페이지",
        address: "서울 강남구 봉은사로 21",
        lat: 37.4955,
        lng: 127.026,
        category: "cafe",
        description: "책을 테마로 한 카페로 늦은 시간까지 운영해요.",
      },
    }),
    prisma.venue.create({
      data: {
        name: "책방 마루",
        address: "서울 강남구 언주로 102",
        lat: 37.502,
        lng: 127.023,
        category: "bookstore",
        description: "청소년 추천 도서가 많은 동네 책방이에요.",
      },
    }),
  ]);

  console.log("Seeding book club meetups...");
  const upcomingMeetup1 = await prisma.bookClubMeetup.create({
    data: {
      venueId: studyCafe.id,
      bookId: wandeuk.id,
      hostId: haneul.id,
      scheduledAt: daysAgo(-1, 18, 30),
      capacity: 5,
      status: "open",
      participants: {
        create: [haneul, doyun, seoyeon].map((s) => ({ userId: s.id })),
      },
    },
  });
  await prisma.bookClubMessage.createMany({
    data: [
      { meetupId: upcomingMeetup1.id, userId: haneul.id, content: "내일 6시 반에 스터디카페에서 만나요! 다들 완득이 어디까지 읽으셨나요?", createdAt: daysAgo(0, 12, 0) },
      { meetupId: upcomingMeetup1.id, userId: doyun.id, content: "저는 8장까지 읽었어요. 조금 늦을 수도 있는데 기다려주세요!", createdAt: daysAgo(0, 12, 20) },
      { meetupId: upcomingMeetup1.id, userId: seoyeon.id, content: "네 좋아요, 자리 미리 잡아둘게요 :)", createdAt: daysAgo(0, 13, 5) },
    ],
  });

  await prisma.bookClubMeetup.create({
    data: {
      venueId: bookshop.id,
      bookId: almond.id,
      hostId: jihoo.id,
      scheduledAt: daysAgo(-3, 17, 0),
      capacity: 4,
      status: "open",
      participants: {
        create: [jihoo, haneul].map((s) => ({ userId: s.id })),
      },
    },
  });

  const pastMeetup = await prisma.bookClubMeetup.create({
    data: {
      venueId: library.id,
      bookId: giver.id,
      hostId: doyun.id,
      scheduledAt: daysAgo(4, 15, 0),
      capacity: 6,
      status: "ended",
      participants: {
        create: [haneul, doyun, seoyeon, jihoo].map((s) => ({ userId: s.id })),
      },
    },
  });
  await prisma.bookClubRating.createMany({
    data: [
      { meetupId: pastMeetup.id, userId: haneul.id, stars: 5, comment: "스터디룸이 조용하고 좋았어요. 다음에도 여기서 하고 싶어요!" },
      { meetupId: pastMeetup.id, userId: doyun.id, stars: 4, comment: "자리는 넉넉했는데 예약이 까다로웠어요." },
      { meetupId: pastMeetup.id, userId: seoyeon.id, stars: 5, comment: "다같이 소리 내어 읽으니까 집중이 더 잘 됐어요." },
      { meetupId: pastMeetup.id, userId: jihoo.id, stars: 4 },
    ],
  });
  await prisma.readingSession.create({
    data: {
      userId: haneul.id,
      bookId: giver.id,
      type: "offline",
      startPage: 60,
      endPage: 92,
      durationSec: 2100,
      date: daysAgo(4, 16, 40),
      bookClubMeetupId: pastMeetup.id,
    },
  });

  console.log("Seed complete.");
  console.log({ userIds: everyone.map((u) => u.id), groupId: group.id, inviteCode: group.inviteCode });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
