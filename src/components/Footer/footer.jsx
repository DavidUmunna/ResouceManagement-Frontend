//import { Link } from "react-router-dom";
//import {Shield,Clipboard,MessageCircle} from "lucide-react"
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-center items-center">
          {/* Logo and copyright */}
          <div className="flex items-center mb-4 md:mb-0">
      
            <span className="text-sm">
              © {currentYear} Halden Nigeria Ltd. All rights reserved.
            </span>
          </div>
          
         {/*

            
          <div className="flex gap-6">
            <Link to="/privacy" className="text-gray-300 hover:text-white text-sm">
              <Shield/>
            </Link>
            <Link to="/terms" className="text-gray-300 hover:text-white text-sm">
              <Clipboard/>
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-white text-sm">
              <MessageCircle/>
            </Link>
          </div>*/
        } 
        </div>
      </div>
    </footer>
  );
}

export default Footer;