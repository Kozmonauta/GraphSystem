{
    "name": "A",
    "definer": "{{coreID}}",
    "nodes": {
        "A0": {
            "label": "A0",
            "name": "A0",
            "fields": {
                "name": {
                    "type": "string"
                }
            }
        },
        "A1": {
            "label": "A1",
            "name": "A1",
            "fields": {
                "name": {
                    "type": "string"
                }
            }
        },
        "A2": {
            "label": "A2",
            "name": "A2",
            "fields": {
                "name": {
                    "type": "string"
                }
            }
        },
        "A3": {
            "label": "A3",
            "name": "A3",
            "fields": {
                "name": {
                    "type": "string"
                }
            }
        },
        "A4": {
            "label": "A4",
            "name": "A4",
            "fields": {
                "name": {
                    "type": "string"
                }
            }
        },
        "A5": {
            "label": "A5",
            "name": "A5",
            "fields": {
                "name": {
                    "type": "string"
                }
            }
        },
        "A6": {
            "label": "A6",
            "name": "A6",
            "fields": {
                "name": {
                    "type": "string"
                }
            }
        },
        "A7": {
            "label": "A7",
            "name": "A7",
            "fields": {
                "name": {
                    "type": "string"
                }
            }
        },
        "A8": {
            "label": "A8",
            "name": "A8",
            "fields": {
                "name": {
                    "type": "string"
                }
            }
        },
        "A9": {
            "label": "A9",
            "name": "A9",
            "fields": {
                "name": {
                    "type": "string"
                }
            }
        },
        "A10": {
            "label": "A10",
            "name": "A10",
            "fields": {
                "name": {
                    "type": "string"
                }
            }
        },
        "A11": {
            "label": "A11",
            "name": "A11",
            "fields": {
                "name": {
                    "type": "string"
                }
            }
        },
        "A12": {
            "label": "A12",
            "name": "A12",
            "fields": {
                "name": {
                    "type": "string"
                }
            }
        }
    },
    "edges": {
        "x_H_A0": {
            "type": "H",
            "target": "A0"
        },
        "A0_H_A1": {
            "type": "H",
            "source": "A0",
            "target": "A1"
        },
        "A0_I_x": {
            "type": "I",
            "source": "A0",
            "optional": true
        },
        "A1_J_A2": {
            "type": "J",
            "source": "A1",
            "target": "A2"
        },
        "A1_K_A3": {
            "type": "K",
            "source": "A1",
            "target": "A3"
        },
        "x_K_A3": {
            "type": "K",
            "target": "A3",
            "multiple": true
        },
        "A1_H_A4": {
            "type": "H",
            "source": "A1",
            "target": "A4"
        },
        "A4_H_A5": {
            "type": "H",
            "source": "A4",
            "target": "A5"
        },
        "A5_H_x": {
            "type": "H",
            "source": "A5",
            "multiple": true
        },
        "A4_H_A6": {
            "type": "H",
            "source": "A4",
            "target": "A6"
        },
        "A4_J_A6": {
            "type": "J",
            "source": "A4",
            "target": "A6"
        },
        "A6_K_A7": {
            "type": "K",
            "source": "A6",
            "target": "A7"
        },
        "A7_I_A8": {
            "type": "I",
            "source": "A7",
            "target": "A8"
        },
        "A6_H_A8": {
            "type": "H",
            "source": "A6",
            "target": "A8"
        },
        "A8_H_A9": {
            "type": "H",
            "source": "A8",
            "target": "A9"
        },
        "A9_H_x": {
            "type": "H",
            "source": "A9",
            "optional": true
        },
        "A9_L_x": {
            "type": "L",
            "source": "A9",
            "optional": true
        },
        "A9_K_x": {
            "type": "K",
            "source": "A9",
            "multiple": true
        },
        "A4_L_A10": {
            "type": "L",
            "source": "A4",
            "target": "A10"
        },
        "x_L_A10": {
            "type": "L",
            "target": "A10",
            "optional": true
        },
        "A11_M_A10": {
            "type": "M",
            "source": "A11",
            "target": "A10"
        },
        "A11_J_A12": {
            "type": "J",
            "source": "A11",
            "target": "A12"
        },
        "x_K_A12": {
            "type": "K",
            "target": "A12",
            "multiple": true
        }
    }
}