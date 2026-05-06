"use client";

import { useState, useEffect, useRef } from "react";
import {
  useCities,
  useCreateCity,
  useUpdateCity,
  useDeleteCity,
} from "@/hooks/location/useCities";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type City = {
  id: number;
  name: string;
  code?: string;
};

export default function CitiesPage() {
  const { data, isLoading } = useCities();
  const cities = data?.data ?? [];

  const createCity = useCreateCity();
  const updateCity = useUpdateCity();
  const deleteCity = useDeleteCity();

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");

  const [editCity, setEditCity] = useState<City | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);

  // ✅ close menu on outside click
  useEffect(() => {
    const handleClick = (e: any) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (isLoading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-4">
      <div className="rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {cities.map((city: City) => (
              <TableRow key={city.id}>
                <TableCell>{city.id}</TableCell>
                <TableCell>{city.name}</TableCell>
                <TableCell>{city.code || "-"}</TableCell>

                
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* CREATE MODAL */}
      {createOpen && (
        <Modal
          onClose={() => {
            setCreateOpen(false);
            setNewName("");
            setNewCode("");
          }}
          title="Create City"
        >
          <Input
            placeholder="City name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <Input
            placeholder="Code"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
          />

          <Button
            onClick={() => {
              createCity.mutate({ name: newName, code: newCode });
              setCreateOpen(false);
            }}
          >
            Save
          </Button>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {editCity && (
        <Modal
          onClose={() => setEditCity(null)}
          title="Edit City"
        >
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />

          <Input
            value={editCode}
            onChange={(e) => setEditCode(e.target.value)}
          />

          <Button
            onClick={() => {
              updateCity.mutate({
                id: editCity.id,
                data: { name: editName, code: editCode },
              });
              setEditCity(null);
            }}
          >
            Update
          </Button>
        </Modal>
      )}
    </div>
  );
}

/* MODAL */
function Modal({ children, title, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 space-y-4 shadow-xl">
        <div className="flex justify-between">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}