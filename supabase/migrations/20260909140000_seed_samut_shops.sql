-- Seed sample approved shops around Mae Klong / Samut Songkhram for testing.
insert into public.shops (name, address, lat, lng, keywords, status)
select *
from (
  values
    (
      'ตลาดแม่กลอง',
      'ถนนราษฎร์ดำเนิน แม่กลอง สมุทรสงคราม',
      13.4098,
      100.0012,
      'ตลาด แม่กลอง ของสด อาหาร',
      'approved'::public.approval_status
    ),
    (
      '7-Eleven แม่กลอง',
      'ใกล้สะพานลม แม่กลอง สมุทรสงคราม',
      13.4125,
      100.0035,
      'เซเว่น 7-eleven ของใช้ ของกิน',
      'approved'::public.approval_status
    ),
    (
      'โลตัส โก แม่กลอง',
      'สมุทรสงคราม',
      13.4182,
      99.9958,
      'โลตัส lotus ของกิน ของใช้',
      'approved'::public.approval_status
    ),
    (
      'แม็คโคร สมุทรสงคราม',
      'สมุทรสงคราม',
      13.4241,
      99.9875,
      'แม็คโคร makro ของแห้ง ของสด',
      'approved'::public.approval_status
    ),
    (
      'ร้านก๋วยเตี๋ยวเรือแม่กลอง',
      'แม่กลอง สมุทรสงคราม',
      13.4106,
      100.0048,
      'ก๋วยเตี๋ยว อาหารตามสั่ง',
      'approved'::public.approval_status
    )
) as v(name, address, lat, lng, keywords, status)
where not exists (
  select 1 from public.shops s where s.name = v.name and s.status = 'approved'
);
