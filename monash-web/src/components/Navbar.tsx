import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Navbar = () => {
  return (
    <header className="header">
        <nav>
            <div className="logo">
                <Link href="/" >
                    <Image src="/vercel.svg" alt='' width={40} height={40} />
                </Link>
                
            </div>
            <div className="nav-links">
                <Link href="/">Home</Link>
                <br />
                <Link href="/about">About</Link>
            </div>
        </nav>
    </header>
  )
}

export default Navbar