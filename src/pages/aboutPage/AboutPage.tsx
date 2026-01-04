import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import styles from './AboutPage.module.css';
import backgroundImage from './background.png';
import moto from './motorola.png';
import nissan from './nissan.png';
import heineken from './heineken.png';
import bs from './bs.png';
import eubs from './eubs.png';

// Đăng ký Plugin
gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const mainRef = useRef(null);

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
      
      {/* BANNER */}
      <div className={styles.banner}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerText}>
            <h1>About Us</h1>
            <div className={styles.navLinks}>
              <a href="/">Home</a>
              <span className={styles.divider}>|</span>
              <a href="/about">About</a>
            </div>
          </div>
          <div className={styles.bannerImage}>
            <img src={backgroundImage} alt="" />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className={styles.contentSection}>
        <div className={styles.imageColumn}>
          <img src={backgroundImage} alt="About us image" className={styles.mainImage} />
        </div>
        <div className={styles.descriptionColumn}>
          <div className={styles.description}>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique assumenda culpa consequuntur eum, nulla provident sed deleniti repellat est iste veniam aliquam libero voluptatibus alias autem iure et numquam inventore?</p>
          </div>
          <div className={styles.description}>
            <h3>Trusted Travel Guide</h3>
            <p>One shall be subjected to arbitary arrest, detention or exile</p>
          </div>
          <div className={styles.description}>
            <h3>Personalized Trips</h3>
            <p>One shall be subjected to arbitary arrest, detention or exile</p>
            <button className={styles.moreBtn}>More About Us</button>
          </div>
        </div>
      </div>

      {/* TIMELINE */}
      <div className={styles.timelineSection}>
        <div className={styles.sectionHeader}>
          <p>Vacation Agency</p>
          <h2>The Best Holidays Start Here!</h2>
        </div>
        <div className={styles.timelineRow}>
          <div className={styles.colContent}>
            <img src={backgroundImage} alt="Cycling" className={styles.timelineImg} />
          </div>
          <div className={styles.colDivider}>
            <div className={styles.line}></div>
            <div className={styles.dot}></div>
          </div>
          <div className={styles.colContent}>
            <div className={styles.textContent}>
              <h3>Traveling on a Budget</h3>
              <p>No one shall be subjected to arbitrary arrest, detention or exile. Everyone is entitled in full equality.</p>
            </div>
          </div>
        </div>
        <div className={`${styles.timelineRow} ${styles.rowReverse}`}>
          <div className={styles.colContent}>
            <img src={backgroundImage} alt="Cycling" className={styles.timelineImg} />
          </div>
          <div className={styles.colDivider}>
            <div className={styles.line}></div>
            <div className={styles.dot}></div>
          </div>
           <div className={styles.colContent}>
             <div className={styles.textContent}>
              <h3>Traveling on a Budget</h3>
              <p>No one shall be subjected to arbitrary arrest, detention or exile. Everyone is entitled in full equality.</p>
            </div>
          </div>
        </div>
        <div className={styles.timelineRow}>
          <div className={styles.colContent}>
            <img src={backgroundImage} alt="Cycling" className={styles.timelineImg} />
          </div>
          <div className={styles.colDivider}>
            <div className={styles.line}></div>
            <div className={styles.dot}></div>
          </div>
          <div className={styles.colContent}>
             <div className={styles.textContent}>
              <h3>Traveling on a Budget</h3>
              <p>No one shall be subjected to arbitrary arrest, detention or exile. Everyone is entitled in full equality.</p>
            </div>
          </div>
        </div>
      </div>

      {/* TEAM */}
      <div className={styles.teamSection}>
        <div className={styles.teamHeader}>
          <h2>Team</h2>
          <h2>Meet The Team</h2>
        </div>
        <div className={styles.teamGrid}>
          <div className={styles.teamCard}>
            <div className={styles.memberImage}>
              <img src={backgroundImage}alt="" />
            </div>
            <div className={styles.memberInfo}>
              <div className={styles.nameRow}>
                <div className={styles.nameBlock}>
                  <h3>Minh Kiet</h3>
                  <span>Anh Minh Kiet ngoi trong quan uong ly ca phe</span>
                </div>
              </div>
            </div>
            <p className={styles.memberDesc}>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            </p>
          </div>
          <div className={styles.teamCard}>
            <div className={styles.memberImage}>
              <img src={backgroundImage}alt="" />
            </div>
            <div className={styles.memberInfo}>
              <div className={styles.nameRow}>
                <div className={styles.nameBlock}>
                  <h3>Minh Kiet</h3>
                  <span>Anh Minh Kiet ngoi trong quan uong ly ca phe</span>
                </div>
              </div>
            </div>
            <p className={styles.memberDesc}>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            </p>
          </div>
        </div>
      </div>

      {/* TRUSTED SECTION */}
      <div className={styles.trustedSection}>
        <h3>Trusted by Thousands of Travelers</h3>
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