"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DollarSign, Plus, Trash2, ArrowRight, ArrowLeft, Users, ShoppingCart } from 'lucide-react';

interface Item {
  id: number;
  name: string;
  price: number;
  sharedWith: number[];
}

interface Person {
  id: number;
  name: string;
  items: Item[];
}

const FocusedInput = ({ value, onChange, placeholder, type = "text" }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      className="bg-gray-800 border-gray-700 text-white"
    />
  );
};

export default function Home() {
  const [screen, setScreen] = useState<'people' | 'items'>('people');
  const [people, setPeople] = useState<Person[]>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const addPerson = () => {
    if (newPersonName.trim()) {
      setPeople([...people, { id: Date.now(), name: newPersonName.trim(), items: [] }]);
      setNewPersonName('');
    }
  };

  const addItem = () => {
    if (newItemName.trim() && newItemPrice.trim()) {
      const newItem: Item = {
        id: Date.now(),
        name: newItemName.trim(),
        price: parseFloat(newItemPrice),
        sharedWith: [],
      };

      const updatedPeople = people.map(person => {
        return { ...person, items: [...person.items, newItem] };
      });

      setPeople(updatedPeople);
      setNewItemName('');
      setNewItemPrice('');
    }
  };

  const removePerson = (personId: number) => {
    setPeople(people.filter(person => person.id !== personId));
  };

  const removeItem = (personId: number, itemId: number) => {
    setPeople(people.map(person => 
      person.id === personId 
        ? { ...person, items: person.items.filter(item => item.id !== itemId) }
        : person
    ));
  };

  const calculateTotal = (items: Item[], personId: number) => {
    return items.reduce((sum, item) => {
      const shareCount = item.sharedWith.length;
      return sum + (item.sharedWith.includes(personId) ? item.price / shareCount : 0);
    }, 0).toFixed(2);
  };

  const PeopleScreen = () => (
    <>
      <Card className="mb-6 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="mr-2" /> Add New Person
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <FocusedInput
              placeholder="Enter name"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
            />
            <Button onClick={addPerson} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {people.map(person => (
          <Card key={person.id} className="mb-4 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex justify-between items-center">
                <span>{person.name}</span>
                <Button variant="destructive" size="icon" onClick={() => removePerson(person.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {people.length > 0 && (
        <Button className="mt-4 bg-green-600 hover:bg-green-700" onClick={() => setScreen('items')}>
          Next: Add Items <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </>
  );

  const ItemsScreen = () => {
    const [localItemName, setLocalItemName] = useState('');
    const [localItemPrice, setLocalItemPrice] = useState('');
    const [localSelectedPeople, setLocalSelectedPeople] = useState<number[]>([]);
    const itemNameRef = useRef<HTMLInputElement>(null);
    const itemPriceRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (itemNameRef.current) {
        itemNameRef.current.focus();
      }
    }, []); // Focus item name input on component mount

    const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalItemName(e.target.value);
    };

    const handleItemPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalItemPrice(e.target.value);
    };

    const togglePersonSelection = (personId: number) => {
      setLocalSelectedPeople(prev => 
        prev.includes(personId)
          ? prev.filter(id => id !== personId)
          : [...prev, personId]
      );
    };

    const handleAddItem = () => {
      if (localItemName.trim() && localItemPrice.trim() && localSelectedPeople.length > 0) {
        const newItem: Item = {
          id: Date.now(),
          name: localItemName.trim(),
          price: parseFloat(localItemPrice),
          sharedWith: localSelectedPeople,
        };

        const updatedPeople = people.map(person => {
          if (localSelectedPeople.includes(person.id)) {
            return { ...person, items: [...person.items, newItem] };
          }
          return person;
        });

        setPeople(updatedPeople);
        setLocalItemName('');
        setLocalItemPrice('');
        setLocalSelectedPeople([]);
        
        if (itemNameRef.current) {
          itemNameRef.current.focus();
        }
      }
    };

    const getCardHeight = (itemCount: number) => {
      const baseHeight = 200; // Increased base height
      const itemHeight = 40; // Height per item
      const maxHeight = 500; // Increased max height
      return Math.min(baseHeight + itemCount * itemHeight, maxHeight);
    };

    return (
      <>
        <Card className="mb-8 bg-gray-800 border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center text-2xl">
              <ShoppingCart className="mr-3 h-6 w-6" /> Add New Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="itemName" className="text-white mb-2 block">Item Name</Label>
                <Input
                  id="itemName"
                  ref={itemNameRef}
                  placeholder="Enter item name"
                  value={localItemName}
                  onChange={handleItemNameChange}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="itemPrice" className="text-white mb-2 block">Price</Label>
                <Input
                  id="itemPrice"
                  ref={itemPriceRef}
                  type="number"
                  placeholder="Enter price"
                  value={localItemPrice}
                  onChange={handleItemPriceChange}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <Label className="text-white mb-3 block">Split with:</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {people.map(person => (
                    <div
                      key={person.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors duration-200 text-center ${
                        localSelectedPeople.includes(person.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => togglePersonSelection(person.id)}
                    >
                      {person.name}
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddItem} className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-2">
                <Plus className="mr-2 h-5 w-5" /> Add Item
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {people.map(person => {
            const cardHeight = getCardHeight(person.items.length);
            return (
              <Card key={person.id} className="bg-gray-800 border-gray-700 shadow-lg transition-all duration-300 ease-in-out overflow-hidden" style={{ height: `${cardHeight}px` }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-xl">{person.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="pr-4" style={{ height: `${cardHeight - 130}px` }}>
                    {person.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                        <span className="text-white">{item.name} - ${(item.price / item.sharedWith.length).toFixed(2)}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeItem(person.id, item.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </ScrollArea>
                  <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center font-bold text-white">
                    <span>Total:</span>
                    <span>${calculateTotal(person.items, person.id)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button className="mt-8 bg-green-600 hover:bg-green-700" onClick={() => setScreen('people')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to People
        </Button>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8 text-center py-6 text-white tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      Venmo Request Manager
        </h1>
        
        {screen === 'people' ? <PeopleScreen /> : <ItemsScreen />}
      </div>
    </div>
  );
}