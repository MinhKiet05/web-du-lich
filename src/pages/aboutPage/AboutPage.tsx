import React, { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import styles from './AboutPage.module.css';
import backgroundImage from './background.png';
import moto from './motorola.png';
import nissan from './nissan.png';
import heineken from './heineken.png';
import bs from './bs.png';
import eubs from './eubs.png';
import p1 from './1.png';
import p2 from './2.png';
import p3 from './3.png';
import p4 from './4.png';
import p5 from './5.png';
import bao from './bao.webp';
import kiet from './kiet.webp';
// Đăng ký Plugin
gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const mainRef = useRef(null);
  const timelineSectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      
      // 1. Banner Animation
      const tl = gsap.timeline();
      tl.from(`.${styles.bannerText} h1`, { y: 50, opacity: 0, duration: 0.8, ease: "power2.out" })
        .from(`.${styles.navLinks}`, { y: 20, opacity: 0, duration: 0.5 }, "-=0.4")
        .from(`.${styles.bannerImage}`, { x: 50, opacity: 0, duration: 0.8 }, "-=0.6");

      // 2. Content Section Animation
      gsap.from(`.${styles.imageColumn}`, {
        scrollTrigger: { trigger: `.${styles.contentSection}`, start: "top 75%" },
        x: -50, opacity: 0, duration: 1, ease: "power3.out"
      });
      gsap.from(`.${styles.descriptionColumn}`, {
        scrollTrigger: { trigger: `.${styles.contentSection}`, start: "top 75%" },
        x: 50, opacity: 0, duration: 1, delay: 0.2, ease: "power3.out"
      });

      // 3. Timeline Animation
      let rows = gsap.utils.toArray(`.${styles.timelineRow}`);
      rows.forEach((row: any) => {
        gsap.from(row, {
          scrollTrigger: { trigger: row, start: "top 85%", toggleActions: "play none none reverse" },
          y: 50, opacity: 0, duration: 0.8, ease: "power2.out"
        });
      });

      // 4. Team Animation
      gsap.from(`.${styles.teamHeader}`, {
        scrollTrigger: { trigger: `.${styles.teamSection}`, start: "top 80%" },
        y: 30, opacity: 0, duration: 0.6
      });
      gsap.from(`.${styles.teamCard}`, {
        scrollTrigger: { trigger: `.${styles.teamGrid}`, start: "top 75%" },
        y: 80, opacity: 0, duration: 0.8, stagger: 0.2, ease: "back.out(1.7)"
      });

      // --- 5. TRUSTED SECTION (ĐÃ FIX LỖI KHÔNG HIỆN) ---
      
      // Header hiện trước
      gsap.from(`.${styles.trustedSection} h3`, {
        scrollTrigger: { 
          trigger: `.${styles.trustedSection}`, 
          start: "top bottom", // Kích hoạt ngay khi vừa chạm đáy màn hình
          toggleActions: "play none none none" 
        },
        y: 30, opacity: 0, duration: 0.8, ease: "power2.out"
      });

      // Logo hiện sau
      const logoImgs = gsap.utils.toArray(`.${styles.logoContainer} img`);
      
      // Dùng fromTo để chắc chắn đích đến là hiện rõ 100%
      gsap.fromTo(logoImgs, 
        { y: 50, opacity: 0 }, // Trạng thái ban đầu
        {
          y: 0, 
          opacity: 1, // Trạng thái kết thúc
          duration: 0.8, 
          stagger: 0.1, 
          ease: "back.out(1.5)",
          scrollTrigger: { 
            trigger: `.${styles.logoContainer}`, 
            start: "top bottom",  // QUAN TRỌNG: Vừa chạm đáy màn hình là chạy ngay
            toggleActions: "play none none none" // Không ẩn đi nữa
          }
        }
      );

    }, mainRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.aboutPage} ref={mainRef}>
      
      <div className={styles.banner} style={{'--bg-image': `url(${backgroundImage})`}as React.CSSProperties}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerText}>
            <h1>Về chúng tôi</h1>
            <div className={styles.navLinks}>
              <Link to="/">Trang chủ</Link>
              <span className={styles.divider}>|</span>
              <Link to="/about">Về chúng tôi</Link>
            </div>
          </div>
          <div className={styles.bannerImage}>
            <img src={p1} alt="" />
          </div>
        </div>
      </div>

      <div className={styles.contentSection}>
        <div className={styles.imageColumn}>
          <img src={p2} alt="About us image" className={styles.mainImage} />
        </div>
        <div className={styles.descriptionColumn}>
          <div className={styles.description}>
            <h3>Mục đích của chúng tôi</h3>
            <p>Được thành lập với niềm đam mê xê dịch, Travlia không chỉ là một công ty du lịch, chúng tôi là người bạn đồng hành tin cậy. Sứ mệnh của chúng tôi là kết nối bạn với những nền văn hóa độc đáo, mang lại những trải nghiệm chân thực và những kỷ niệm vô giá.</p>
          </div>
          <div className={styles.description}>
            <h3>Hướng dẫn viên bản địa</h3>
            <p>Đội ngũ hướng dẫn viên của chúng tôi không chỉ là người dẫn đường, họ là những 'cuốn từ điển sống'. Họ am hiểu từng ngõ ngách, quán xá và những bí mật lịch sử mà chưa một cuốn sách du lịch nào kịp ghi chép, mang đến cho bạn góc nhìn sâu sắc nhất.</p>
          </div>
          <div className={styles.description}>
            <h3>Lịch trình được cá nhân hoá!</h3>
            <p>Chúng tôi nói không với những chuyến đi rập khuôn. Mọi lịch trình đều được 'may đo' tỉ mỉ dựa trên tính cách, sở thích và nhịp điệu riêng của bạn, đảm bảo mỗi khoảnh khắc trôi qua đều trọn vẹn ý nghĩa và cảm xúc.</p>
            <button 
              className={styles.moreBtn}
              onClick={() => {
                timelineSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Hiểu thêm về chúng tôi
            </button>
          </div>
        </div>
      </div>

      <div className={styles.timelineSection} ref={timelineSectionRef}>
        <div className={styles.sectionHeader}>
          <p>Hành trình của chúng tôi</p>
          <h2>Vì sao chọn Travlia?</h2>
        </div>
        <div className={styles.timelineRow}>
          <div className={styles.colContent}>
            <img src={p3} alt="Cycling" className={styles.timelineImg} />
          </div>
          <div className={styles.colDivider}>
            <div className={styles.line}></div>
            <div className={styles.dot}></div>
          </div>
          <div className={styles.colContent}>
            <div className={styles.textContent}>
              <h3>Lên kế hoạch dễ dàng</h3>
              <p>Hãy gạt bỏ mọi áp lực về thủ tục giấy tờ hay đặt phòng phức tạp. Với quy trình chuẩn hóa 5 sao, chúng tôi xử lý trọn gói từ visa, vé máy bay đến những resort nghỉ dưỡng cao cấp nhất. Việc duy nhất bạn cần làm là chuẩn bị một tâm hồn đẹp để tận hưởng chuyến đi.</p>
            </div>
          </div>
        </div>
        <div className={`${styles.timelineRow} ${styles.rowReverse}`}>
          <div className={styles.colContent}>
            <img src={p4} alt="Cycling" className={styles.timelineImg} />
          </div>
          <div className={styles.colDivider}>
            <div className={styles.line}></div>
            <div className={styles.dot}></div>
          </div>
           <div className={styles.colContent}>
             <div className={styles.textContent}>
              <h3>Trải Nghiệm Văn Hóa Độc Bản</h3>
              <p>Không chỉ là những điểm đến thông thường, chúng tôi mang đến cho bạn những trải nghiệm văn hóa độc đáo, nơi bạn có thể hòa mình vào đời sống địa phương và khám phá những điều chưa từng biết.</p>
            </div>
          </div>
        </div>
        <div className={styles.timelineRow}>
          <div className={styles.colContent}>
            <img src={p5} alt="Cycling" className={styles.timelineImg} />
          </div>
          <div className={styles.colDivider}>
            <div className={styles.line}></div>
            <div className={styles.dot}></div>
          </div>
          <div className={styles.colContent}>
             <div className={styles.textContent}>
              <h3>Hệ Thống Hỗ Trợ Toàn Cầu 24/7</h3>
              <p>Sự an toàn của bạn là ưu tiên tuyệt đối. Dù bạn đang ở Paris hoa lệ hay vùng núi cao Nepal, đội ngũ phản ứng nhanh của Travlia luôn túc trực 24/7 để giải quyết mọi tình huống phát sinh, đảm bảo hành trình của bạn luôn suôn sẻ và an yên.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.teamSection}>
        <div className={styles.teamHeader}>
          <h2>Đội ngũ của chúng tôi</h2>
          <h2>Những Người Kiến Tạo Giấc Mơ</h2>
        </div>
        <div className={styles.teamGrid}>
          <div className={styles.teamCard}>
            <div className={styles.memberImage}>
              <img src={kiet}alt="" />
            </div>
            <div className={styles.memberInfo}>
              <div className={styles.nameRow}>
                <div className={styles.nameBlock}>
                  <h3>Minh Kiệt</h3>
                  <span>Nhà sáng lập và CEO</span>
                </div>
              </div>
            </div>
            <p className={styles.memberDesc}>
              Với hành trình thám hiểm hơn 1 thập kỷ qua 30 quốc gia, Minh Kiết dồn toàn bộ tâm huyết để xây dựng Travlia. Anh tin rằng mỗi chuyến đi không chỉ là sự dịch chuyển địa lý, mà là quá trình thay đổi tư duy và làm giàu vốn sống
            </p>
          </div>
          <div className={styles.teamCard}>
            <div className={styles.memberImage}>
              <img src={bao}alt="" />
            </div>
            <div className={styles.memberInfo}>
              <div className={styles.nameRow}>
                <div className={styles.nameBlock}>
                  <h3>Gia Bảo</h3>
                  <span>Giám Đốc Vận Hành</span>
                </div>
              </div>
            </div>
            <p className={styles.memberDesc}>
              Là người cầu toàn và tỉ mỉ, Gia Bảo đảm bảo từng chi tiết nhỏ nhất trong chuyến đi – từ chiếc khăn trải bàn đến hương vị món ăn – đều phải hoàn hảo. Anh  là 'nhạc trưởng' đứng sau sự thành công của hàng ngàn tour cao cấp
            </p>
          </div>
        </div>
      </div>

      <div className={styles.trustedSection}>
        <h3>Được Tin Tưởng Bởi Hơn 50.000 Du Khách Toàn Cầu</h3>
        <div className={styles.logoContainer}>
           <img src={nissan} alt="Nissan" />
           <img src={moto} alt="Motorola" />
           <img src={heineken} alt="Heineken" />
           <img src={bs} alt="BS" />
           <img src={eubs} alt="EUBS" />
        </div>
      </div>

    </div>
  );
}