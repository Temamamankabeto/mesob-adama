"use client";

import { useState } from "react";

import {
  useServices,
  useServiceForms,
  useServiceFormMutations,
} from "@/hooks/services/use-service";

import {
  CreateServiceFormPayload,
  Service,
  ServiceForm,
} from "@/types/services/service";

export default function ServiceFormsPage() {

  /*
  |--------------------------------------------------------------------------
  | QUERIES
  |--------------------------------------------------------------------------
  */

  const {
    data,
    isLoading,
  } = useServiceForms();

  const {
    data: servicesData,
  } = useServices();

  /*
  |--------------------------------------------------------------------------
  | MUTATIONS
  |--------------------------------------------------------------------------
  */

  const {
    create,
    update,
  } = useServiceFormMutations();

  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

  const forms: ServiceForm[] =
    data?.data?.data || [];

  const services: Service[] =
    servicesData?.data?.data || [];

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [open, setOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [formData, setFormData] =
    useState<CreateServiceFormPayload>({

      service_id: 0,

      title: "",

      description: "",

      is_active: true,
    });

  /*
  |--------------------------------------------------------------------------
  | HELPERS
  |--------------------------------------------------------------------------
  */

  function getServiceName(
    serviceId: number
  ) {

    return services.find(
      (service) =>
        service.id === serviceId
    )?.name || "-";
  }

  /*
  |--------------------------------------------------------------------------
  | HANDLERS
  |--------------------------------------------------------------------------
  */

  async function handleSubmit() {

    try {

      if (editingId) {

        await update.mutateAsync({

          id: editingId,

          payload: formData,
        });

      } else {

        await create.mutateAsync(
          formData
        );
      }

      setOpen(false);

      setEditingId(null);

      setFormData({

        service_id: 0,

        title: "",

        description: "",

        is_active: true,
      });

    } catch (error) {

      console.error(error);
    }
  }

  function handleEdit(
    form: ServiceForm
  ) {

    setEditingId(form.id);

    setFormData({

      service_id:
        form.service_id,

      title:
        form.title,

      description:
        form.description || "",

      is_active:
        form.is_active,
    });

    setOpen(true);
  }

  async function handleToggleStatus(
    form: ServiceForm
  ) {

    try {

      await update.mutateAsync({

        id: form.id,

        payload: {

          is_active:
            !form.is_active,
        },
      });

    } catch (error) {

      console.error(error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-bold">
            Service Forms
          </h1>

          <p className="text-sm text-gray-500">
            Manage dynamic service forms
          </p>

        </div>

        <button
          onClick={() => {

            setEditingId(null);

            setFormData({

              service_id: 0,

              title: "",

              description: "",

              is_active: true,
            });

            setOpen(true);
          }}
          className="rounded-lg bg-black px-4 py-2 text-sm text-white"
        >
          Create Form
        </button>

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border bg-white">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 text-left">
                ID
              </th>

              <th className="p-3 text-left">
                Title
              </th>

              <th className="p-3 text-left">
                Service
              </th>

              <th className="p-3 text-left">
                Status
              </th>

              <th className="p-3 text-left">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {isLoading ? (

              <tr>

                <td
                  colSpan={5}
                  className="p-6 text-center"
                >
                  Loading...
                </td>

              </tr>

            ) : forms.length === 0 ? (

              <tr>

                <td
                  colSpan={5}
                  className="p-6 text-center"
                >
                  No forms found
                </td>

              </tr>

            ) : (

              forms.map((form) => (

                <tr
                  key={form.id}
                  className="border-t"
                >

                  {/* ID */}

                  <td className="p-3">
                    {form.id}
                  </td>

                  {/* TITLE */}

                  <td className="p-3">
                    {form.title}
                  </td>

                  {/* SERVICE */}

                  <td className="p-3">
                    {getServiceName(
                      form.service_id
                    )}
                  </td>

                  {/* STATUS */}

                  <td className="p-3">

                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        form.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {form.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </td>

                  {/* ACTIONS */}

                  <td className="p-3">

                    <div className="flex items-center gap-2">

                      {/* EDIT */}

                      <button
                        onClick={() =>
                          handleEdit(form)
                        }
                        className="rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        Edit
                      </button>

                      {/* TOGGLE */}

                      <button
                        onClick={() =>
                          handleToggleStatus(
                            form
                          )
                        }
                        className={`rounded px-3 py-1 text-xs font-medium ${
                          form.is_active
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {form.is_active
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* MODAL */}

      {open && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

          <div className="w-full max-w-lg rounded-xl bg-white p-6">

            {/* TITLE */}

            <h2 className="mb-4 text-xl font-bold">

              {editingId
                ? "Edit Service Form"
                : "Create Service Form"}

            </h2>

            <div className="space-y-4">

              {/* SERVICE */}

              <div className="space-y-2">

                <label className="text-sm font-medium">
                  Service
                </label>

                <select
                  value={formData.service_id}
                  onChange={(e) =>
                    setFormData({

                      ...formData,

                      service_id:
                        Number(
                          e.target.value
                        ),
                    })
                  }
                  className="w-full rounded border p-3"
                >

                  <option value={0}>
                    Select Service
                  </option>

                  {services.map(
                    (service) => (

                      <option
                        key={service.id}
                        value={service.id}
                      >
                        {service.name}
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* TITLE */}

              <div className="space-y-2">

                <label className="text-sm font-medium">
                  Title
                </label>

                <input
                  type="text"
                  placeholder="Form Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({

                      ...formData,

                      title:
                        e.target.value,
                    })
                  }
                  className="w-full rounded border p-3"
                />

              </div>

              {/* DESCRIPTION */}

              <div className="space-y-2">

                <label className="text-sm font-medium">
                  Description
                </label>

                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({

                      ...formData,

                      description:
                        e.target.value,
                    })
                  }
                  className="w-full rounded border p-3"
                />

              </div>

              {/* ACTIVE */}

              <div className="flex items-center gap-2">

                <input
                  type="checkbox"
                  checked={
                    formData.is_active
                  }
                  onChange={(e) =>
                    setFormData({

                      ...formData,

                      is_active:
                        e.target.checked,
                    })
                  }
                />

                <label className="text-sm">
                  Active
                </label>

              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3">

                <button
                  onClick={() => {

                    setOpen(false);

                    setEditingId(null);
                  }}
                  className="rounded border px-4 py-2"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleSubmit
                  }
                  disabled={
                    create.isPending ||
                    update.isPending
                  }
                  className="rounded bg-black px-4 py-2 text-white"
                >
                  {create.isPending ||
                  update.isPending
                    ? "Saving..."
                    : editingId
                    ? "Update"
                    : "Save"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}