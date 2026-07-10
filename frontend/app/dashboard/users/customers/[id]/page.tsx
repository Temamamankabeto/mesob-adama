"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  User,
  Shield,
  Activity,
  Calendar,
  Hash,
} from "lucide-react";
import { useEffect, useState } from "react";


export default function CustomerShowPage() {

  const params = useParams();
  const router = useRouter();

  const id = params.id;


  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {

    if (!id) return;


    fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/${id}`)

      .then(res => res.json())

      .then(data => {

        setCustomer(data.data);

      })

      .catch(err => {

        console.log(err);

      })

      .finally(()=>{

        setLoading(false);

      });


  },[id]);




  if(loading){

    return (

      <div className="p-10 text-center text-gray-500">

        Loading customer...

      </div>

    );

  }



  if(!customer){

    return (

      <div className="p-10 text-center text-red-500">

        Customer not found

      </div>

    );

  }



  const roles =
    customer.roles
      ?.map((role:any)=>role.name)
      .join(", ") || "Customer";




  return (

    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">



      {/* Top Header */}

      <div className="flex justify-between items-center">


        <div>

          <h1 className="text-3xl font-bold">
            Customer Profile
          </h1>


          <p className="text-gray-500">
            Manage customer information
          </p>


        </div>



        <button

          onClick={()=>router.back()}

          className="
          flex items-center gap-2
          bg-white
          border
          px-4 py-2
          rounded-lg
          hover:bg-gray-100
          "

        >

          <ArrowLeft size={18}/>

          Back

        </button>


      </div>





      {/* Profile Card */}

      <div className="
        bg-white
        rounded-xl
        shadow
        p-6
        flex
        items-center
        gap-6
      ">


        <div className="
          w-20 h-20
          rounded-full
          bg-blue-100
          flex
          items-center
          justify-center
          text-blue-600
          text-3xl
          font-bold
        ">

          {customer.name?.charAt(0)}

        </div>



        <div>


          <h2 className="text-2xl font-bold">

            {customer.name}

          </h2>


          <p className="text-gray-500 flex items-center gap-2">

            <Mail size={16}/>

            {customer.email}

          </p>



          <div className="mt-3 flex gap-2">


            <span className="
              bg-blue-100
              text-blue-700
              px-3 py-1
              rounded-full
              text-sm
            ">

              {roles}

            </span>



            <span
            className={`px-3 py-1 rounded-full text-sm ${
              customer.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
            }`}
            >

              {customer.status}

            </span>



          </div>



        </div>



      </div>







      {/* Information Grid */}

      <div className="grid md:grid-cols-2 gap-6">





        <div className="
          bg-white
          rounded-xl
          shadow
          p-6
        ">


          <h3 className="font-bold mb-5">
            Account Information
          </h3>



          <div className="space-y-5">



            <InfoItem
              icon={<User size={18}/>}
              title="Full Name"
              value={customer.name}
            />



            <InfoItem
              icon={<Shield size={18}/>}
              title="Role"
              value={roles}
            />



            <InfoItem
              icon={<Activity size={18}/>}
              title="Status"
              value={customer.status}
            />



          </div>


        </div>






        <div className="
          bg-white
          rounded-xl
          shadow
          p-6
        ">


          <h3 className="font-bold mb-5">
            System Information
          </h3>



          <div className="space-y-5">



            <InfoItem
              icon={<Hash size={18}/>}
              title="Customer ID"
              value={`#${customer.id}`}
            />



            <InfoItem
              icon={<Calendar size={18}/>}
              title="Created Date"
              value={
                new Date(customer.created_at)
                .toLocaleDateString()
              }
            />



          </div>



        </div>



      </div>





    </div>

  );

}




function InfoItem({
  icon,
  title,
  value
}:{
  icon:any;
  title:string;
  value:string;
}){


return (

<div className="flex items-center gap-3">


  <div className="
    w-10 h-10
    rounded-lg
    bg-gray-100
    flex
    items-center
    justify-center
  ">

    {icon}

  </div>


  <div>

    <p className="text-sm text-gray-500">

      {title}

    </p>


    <p className="font-medium">

      {value}

    </p>


  </div>



</div>


);


}