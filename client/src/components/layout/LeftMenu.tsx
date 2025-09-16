import { Link } from "react-router-dom"

const LeftMenu = () => {
  return (
    <div className='w-[200px] bg-gray-200 p-4'>
      <h1>Left Menu</h1>
      <Link to="/dashboard" className="block mt-2 text-blue-600 hover:underline">Dashboard</Link>
      <Link to="/users" className="block mt-2 text-blue-600 hover:underline">Users</Link>
    </div>
  )
}

export default LeftMenu
