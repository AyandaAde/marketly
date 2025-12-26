"use client";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
  useModal,
} from "@/components/ui/animated-modal";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowRight, Loader } from "lucide-react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

interface MatchWithConsultantModalProps {
  inquiry: string;
}

export function MatchWithConsultantModal({
  inquiry,
}: MatchWithConsultantModalProps) {
  return (
    <Modal>
      <ModalTrigger
        className="relative mx-auto mt-8 overflow-hidden flex justify-center items-center
                      group/modal-btn bg-linear-to-r from-primary to-primary/90
                      text-white hover:shadow-lg hover:shadow-primary/40
                      transition-all duration-300 h-[37px] font-semibold whitespace-nowrap px-4
                      "
      >
        <span
          className=" transition-transform duration-500
                      group-hover/modal-btn:translate-x-[120%]
                  "
        >
          Match with the Best Consultant
        </span>

        <div
          className="absolute inset-0 flex items-center justify-center
                      transition-transform duration-500
                      -translate-x-full group-hover/modal-btn:translate-x-0
                  "
        >
          📃
        </div>
      </ModalTrigger>
      <MatchWithConsultantContent inquiry={inquiry} />
    </Modal>
  );
}

const inquirySchema = z.object({
  inquiry: z
    .string({ message: "Please enter an inquiry." })
    .min(1, { message: "Please enter an inquiry." }),
});

type InquiryData = z.infer<typeof inquirySchema>;

export function MatchWithConsultantContent({
  inquiry,
}: MatchWithConsultantModalProps) {
  const { setOpen } = useModal();
  const images = [
    "/images/james-richardson.jpg",
    "/images/joseph-gonzalez.jpg",
    "/images/lola-dam.jpg",
  ];

  const inquiryForm = useForm<InquiryData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      inquiry: "",
    },
  });

  const sumbitInquiry = useMutation({
    mutationFn: async (data: InquiryData) => {
      const { data: returnData } = await axios.post(
        "/api/match-with-consultant",
        data
      );
      return returnData;
    },
  });

  const onSubmit = (data: InquiryData) => {
    console.log("Submitting.");
    sumbitInquiry.mutate(data, {});
  };

  return (
    <div
      className="inset-0 z-50  flex items-center justify-center"
      role="dialog"
    >
      <ModalBody>
        <ModalContent className="overflow-y-scroll overflow-x-hidden scrollbar-hide">
          <div className="space-y-2 text-center mb-8">
            <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center">
              Match with the best{" "}
              <span className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 border border-gray-200">
                Consultant!
              </span>{" "}
              📧
            </h4>
            <p className="text-muted-foreground">
              Type in your inquiry and get matched with the best consultant.
            </p>
          </div>
          <div className="flex justify-center items-center">
            {images.map((image, idx) => (
              <motion.div
                key={"images" + idx}
                style={{
                  rotate: Math.random() * 20 - 10,
                }}
                whileHover={{
                  scale: 1.1,
                  rotate: 0,
                  zIndex: 100,
                }}
                whileTap={{
                  scale: 1.1,
                  rotate: 0,
                  zIndex: 100,
                }}
                className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-neutral-100 shrink-0 overflow-hidden"
              >
                <img
                  src={image}
                  alt="bali images"
                  width="500"
                  height="500"
                  className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
                />
              </motion.div>
            ))}
          </div>
          <Form {...inquiryForm}>
            <form
              onSubmit={inquiryForm.handleSubmit(onSubmit)}
              className="space-y-4 mt-5 w-10/12 mx-auto"
            >
              <FormField
                control={inquiryForm.control}
                name="inquiry"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="inquiry">Inquiry</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="I'd like to enquire about SEO."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-700/90" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-linear-to-r from-primary to-primary/90 text-white hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 h-11 font-semibold"
              >
                {sumbitInquiry.isPending ? (
                  <>
                    <Loader className="ml-2 h-4 w-4 animate-spin" />
                    Submitting Inquiry...
                  </>
                ) : (
                  <>
                    Submit Inquiry <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </ModalContent>
        <ModalFooter className="gap-4">
          <Button
            variant="outline"
            className="px-2 py-1 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28"
            onClick={() => {
              setOpen(false);
              inquiryForm.reset();
            }}
            aria-label="Close modal"
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalBody>
    </div>
  );
}
