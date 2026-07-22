<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{

    private string $baseUrl;
    private string $token;
    private string $senderId;


    public function __construct()
    {

        $this->baseUrl = env(
            'DAGU_SMS_BASE_URL'
        );

        $this->token = env(
            'DAGU_SMS_TOKEN'
        );

        $this->senderId = env(
            'DAGU_SMS_SENDER_ID',
            '9141'
        );


        if(
            !$this->baseUrl ||
            !$this->token
        ){

            throw new \Exception(
                "DAGU SMS configuration missing"
            );

        }

    }



    /**
     * Send SMS by phone
     */
    public function sendToPhone(
        string $phone,
        string $message
    )
    {

        return $this->sendSms(
            $phone,
            $message
        );

    }




    /**
     * Alias method
     */
    public function sendByPhone(
        string $phone,
        string $message
    )
    {

        return $this->sendToPhone(
            $phone,
            $message
        );

    }





    /**
     * Send OTP
     */
    public function sendOtp(
        string $phone
    )
    {

        $otp = random_int(
            100000,
            999999
        );


        $message =
            "Your verification code is {$otp}";



        return [

            'otp'=>$otp,

            'response'=>
                $this->sendSms(
                    $phone,
                    $message
                )

        ];

    }





    /**
     * Send bulk SMS
     */
    public function sendBulk(
        array $phones,
        string $message
    )
    {

        $results=[];


        foreach($phones as $phone){

            $results[] =
                $this->sendSms(
                    $phone,
                    $message
                );

        }


        return $results;

    }





    /**
     * Dagu SMS API
     */
    private function sendSms(
        string $phone,
        string $message
    )
    {

        try {


            $response = Http::timeout(30)

                ->withHeaders([

                    'Authorization'=>
                    'Bearer '.$this->token

                ])

                ->post(

                    $this->baseUrl.'/by-phone',

                    [

                        'senderID'=>
                        $this->senderId,


                        'message'=>
                        $message,


                        'phone'=>
                        $phone,


                        'flash'=>false

                    ]

                );




            return [

                'success'=>
                    $response->successful(),


                'status'=>
                    $response->status(),


                'data'=>
                    $response->json()

            ];



        }catch(\Throwable $e){


            Log::error(
                "Dagu SMS Error: ".$e->getMessage()
            );


            return [

                'success'=>false,

                'error'=>
                    $e->getMessage()

            ];

        }


    }


}