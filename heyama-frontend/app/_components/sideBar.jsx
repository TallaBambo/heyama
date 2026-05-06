"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logOut } from "../_data_services/auth";

function SideBar() {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    {
      name: "compte",
      link: "/admin",
      icon: "fa-user",
    },
    {
      name: "produits",
      link: "/admin/products",
      icon: "fa-shop",
    },
    {
      name: "ajouter des produits",
      link: "/admin/add-products",
      icon: "fa-cart-plus",
    },
  ];

  return (
    <>
      <ul className="sideBar">
        {navLinks.map((link) => (
          <li key={link.link}>
            <Link
              href={link.link}
              className={`display-flex ${pathname === link.link && "active"}`}
            >
              <span className="display-flex">
                <i className={`fa-solid ${link.icon}`}></i>
              </span>
              <small className="display-flex">{link.name}</small>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export default SideBar;
